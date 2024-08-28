import * as React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged, OAuthCredential, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase の設定
const firebaseConfig = {
  apiKey: "AIzaSyDKDspFfPZg6zi_XxjPrAJmpZVMZ2aFADw",
  authDomain: "lang-stocker.firebaseapp.com",
  projectId: "lang-stocker",
  storageBucket: "lang-stocker.appspot.com",
  messagingSenderId: "101004150992",
  appId: "1:101004150992:web:48bfa1fbb1225acbaef6d5"
};

// Firebase アプリの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = React.useState<User | undefined>(undefined);

  // バックグラウンドにサインイン状態を問い合わせる
  React.useEffect(() => {
    chrome.runtime.sendMessage({ type: 'signin-state' }, function (response) {
      if (response?.type === 'signin-state') {
        setUser(response.user);
      }
    });
  }, []);

  // サインイン状態をウォッチする
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, function (user) {
      if (user) {
        setUser((prevUser: User | undefined) => {
          if (prevUser && prevUser.uid === user.uid) {
            return prevUser;
          }
          return user;
        });
      } else {
        setUser(undefined);
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // サインインボタンを押下した時に呼び出される
  const signinWithPopup = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: 'signin' }); // バックグラウンドに移譲する
  }, []);

  // ブラウザでログインしているユーザのGoogle認証情報を使用してサインイン
  const signinWithChromeUser = React.useCallback((interactive: boolean) => {
    chrome.identity.getAuthToken({ interactive }, function (token) {
      if (chrome.runtime.lastError && !interactive) {
        console.log('トークンの自動取得失敗');
      } else if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else if (token) {
        // OAuth Access Tokenでfirebase認証
        const credential: OAuthCredential = GoogleAuthProvider.credential(null, token);
        signInWithCredential(auth, credential).catch(function (error) {
          // OAuth Access Tokenが無効なため、キャッシュをクリアして再試行
          if (error.code === 'auth/invalid-credential') {
            chrome.identity.removeCachedAuthToken({ token: token }, function () {
              signinWithChromeUser(interactive);
            });
          }
        });
      } else {
        console.error('トークンがnull');
      }
    });
  }, []);

  // サインアウトボタンを押下した時に呼び出される
  const signout = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: 'signout' }); // バックグラウンドに転送する
  }, []);

  return (
    <div style={{ width: 200, padding: '1rem' }}>
      <h3>Firebaseで認証</h3>
      {user && (<p>{user.displayName}がサインインしています</p>)}
      <div>
        {!user && (
          <div>
            <p>ブラウザでログイン中のGoogleユーザでサインインする場合はこちら</p>
            <button onClick={() => { signinWithChromeUser(true) }}>サインイン(1)</button>
            <p>その他のGoogleユーザでサインインする場合はこちら</p>
            <button onClick={signinWithPopup}>サインイン(2)</button>
          </div>
        )}
        {user && (<button onClick={signout}>サインアウト</button>)}
      </div>
    </div>
  );
};

export default App;
