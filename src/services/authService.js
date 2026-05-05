import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export async function registerUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  await setDoc(doc(db, "Users", user.uid), {
    email: user.email,
    role: "user",
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
}

export async function logoutUser() {
  return await signOut(auth);
}

export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserRole(uid) {
  const userDoc = await getDoc(doc(db, "Users", uid));

  if (!userDoc.exists()) {
    return null;
  }

  return userDoc.data().role;
}
