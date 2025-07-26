import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export interface SavedItem {
  id?: string;
  type: "story" | "worksheet" | "visual-aid" | "reading-assessment" | "ai-chat";
  title: string;
  content: string;
  metadata: Record<string, any>;
  createdAt?: Date;
  userId: string;
}

const LIBRARY_COLLECTION = "library";

export async function saveToLibrary(item: Omit<SavedItem, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, LIBRARY_COLLECTION), {
    ...item,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getLibraryItems(userId: string): Promise<SavedItem[]> {
  const q = query(
    collection(db, LIBRARY_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    } as SavedItem;
  });
}

export async function deleteLibraryItem(id: string): Promise<void> {
  await deleteDoc(doc(db, LIBRARY_COLLECTION, id));
}

export async function getLibraryItem(id: string): Promise<SavedItem | null> {
  const docRef = doc(db, LIBRARY_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  } as SavedItem;
}
