import { initializeApp } from "firebase/app";

import {
  createUserWithEmailAndPassword,
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  addDoc,
  collection,
  CollectionReference,
  DocumentData,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBe6HRpWtFaN6zAFvpbbmavX-xr3b757S8",
  authDomain: "chatapp-9c0f8.firebaseapp.com",
  projectId: "chatapp-9c0f8",
  storageBucket: "chatapp-9c0f8.firebasestorage.app",
  messagingSenderId: "588994329916",
  appId: "1:588994329916:web:a93a028cac90b2972ff239"
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

const storage = getStorage(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
  onAuthStateChanged,
  db,
  addDoc,
  collection,
  messagesCollection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  storage,
  ref,
  uploadBytes,
  getDownloadURL
};
