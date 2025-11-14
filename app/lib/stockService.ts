import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export async function getUserStocks(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().savedStocks || [];
  return [];
}

export async function addUserStock(uid: string, stock: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const current = snap.data().savedStocks || [];
    if (current.includes(stock)) throw new Error("Already added");
    if (current.length >= 5) throw new Error("You can only save 5 stocks");
    await updateDoc(ref, { savedStocks: arrayUnion(stock) });
  } else {
    await setDoc(ref, { savedStocks: [stock] });
  }
}

export async function removeUserStock(uid: string, stock: string) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { savedStocks: arrayRemove(stock) });
}
