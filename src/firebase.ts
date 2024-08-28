import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ※firebase consoleなどを確認し、適宜必要な情報を入力する
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
const firestore = getFirestore(app);