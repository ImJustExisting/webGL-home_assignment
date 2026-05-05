import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// Collection name in Firestore
const furnitureCollection = collection(db, "Furniture");

// Real-time listener for all furniture products
export function listenToFurniture(callback) {
  const q = query(furnitureCollection, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const furniture = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(furniture);
  });

  return unsubscribe;
}

// Get one furniture item by ID
export async function getFurnitureById(id) {
  const docRef = doc(db, "Furniture", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

// Add new furniture product
export async function addFurniture(data) {
  return await addDoc(furnitureCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Update existing furniture product
export async function updateFurniture(id, data) {
  const docRef = doc(db, "Furniture", id);
  return await updateDoc(docRef, data);
}

// Delete furniture product
export async function deleteFurniture(id) {
  const docRef = doc(db, "Furniture", id);
  return await deleteDoc(docRef);
}