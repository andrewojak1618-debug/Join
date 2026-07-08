import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const app = initializeApp(window.joinFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


async function registerFirebaseUser(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return getStoredFirebaseUser(userCredential.user, "firebase-signup");
}


async function loginFirebaseUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return getStoredFirebaseUser(userCredential.user, "firebase-login");
}


async function logoutFirebaseUser() {
  await signOut(auth);
}


function getStoredFirebaseUser(user, type) {
  return {
    name: user.displayName || user.email,
    email: user.email,
    uid: user.uid,
    type,
  };
}


window.joinFirebaseAuth = {
  loginFirebaseUser,
  logoutFirebaseUser,
  registerFirebaseUser,
};

window.joinFirestore = db;