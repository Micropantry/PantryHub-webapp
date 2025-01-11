// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD0zVmA4fwncEOMYyAiD7PmZ-xn321Xca8",
    authDomain: "gix-little-pantry.firebaseapp.com",
    projectId: "gix-little-pantry",
    storageBucket: "gix-little-pantry.firebasestorage.app",
    messagingSenderId: "288082578057",
    appId: "1:288082578057:web:aec3c5dfb11c71931b9458"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
