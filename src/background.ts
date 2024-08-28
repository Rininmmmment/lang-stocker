import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

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

type MessageType = { type: string }

function onSigninRequest(message: MessageType, _sender: chrome.runtime.MessageSender, _sendResponse: () => void) {
    if (message.type === 'signin') {
        // ポップアップによるGoogle認証
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(() => {
            console.log('サインインに失敗');
        });
        _sendResponse();
    } else if (message.type === 'signout') {
        if (auth.currentUser) {
            signOut(auth).catch(() => {
                console.log('サインアウトに失敗');
            });
        }
        _sendResponse();
    }
}

function initApp() {
    // ユーザーがサインイン/サインアウトした際に呼び出される
    onAuthStateChanged(auth, function (user) {
        // ポップアップ側からのサインイン状態取得リクエストを受け付ける
        chrome.runtime.onMessage.addListener(function onReceiveAuthStateRequest(message: MessageType, _sender, _sendResponse) {
            if (message.type === 'signin-state') {
                if (user) {
                    _sendResponse({ type: 'signin-state', user });
                } else {
                    _sendResponse({ type: 'signin-state' });
                }
            }
        });
    });
    // ポップアップ側からのサインインリクエストを受け付ける
    chrome.runtime.onMessage.addListener(onSigninRequest);
}

window.onload = function () {
    initApp();
};
