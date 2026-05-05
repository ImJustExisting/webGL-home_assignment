import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const savedConfigsCollection = collection(db, "SavedConfigurations");

export async function saveConfiguration(user, product, selectedColor) {
  if (!user) {
    throw new Error("User must be logged in to save a configuration.");
  }

  if (!product) {
    throw new Error("No product selected.");
  }

  if (!selectedColor) {
    throw new Error("Please select a colour before saving.");
  }

  return await addDoc(savedConfigsCollection, {
    userId: user.uid,
    furnitureId: product.id,
    furnitureName: product.name,
    category: product.category,
    price: product.price,
    dimensions: product.dimensions,
    modelPath: product.modelPath,
    colorTarget: product.colorTarget || "WOOD",
    selectedColor: {
      name: selectedColor.name,
      hex: selectedColor.hex,
    },
    savedAt: serverTimestamp(),
  });
}

export async function getUserSavedConfigurations(userId) {
  const q = query(savedConfigsCollection, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function deleteSavedConfiguration(configId) {
  const docRef = doc(db, "SavedConfigurations", configId);
  return await deleteDoc(docRef);
}

/* NEW: check if this exact product + colour is already saved */
export async function checkSavedConfiguration(userId, furnitureId, selectedColor) {
  if (!userId || !furnitureId || !selectedColor?.hex) {
    return false;
  }

  const q = query(
    savedConfigsCollection,
    where("userId", "==", userId),
    where("furnitureId", "==", furnitureId),
    where("selectedColor.hex", "==", selectedColor.hex)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}