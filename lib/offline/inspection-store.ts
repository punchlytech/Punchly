/**
 * IndexedDB store for offline inspection data persistence.
 * Stores in-progress inspections including photo blobs so
 * work is never lost on page refresh or connectivity loss.
 */

const DB_NAME = "punchly-offline";
const DB_VERSION = 1;
const STORE_NAME = "inspections";

export interface OfflineInspection {
  id: string;
  projectName: string;
  unitNumber: string;
  clientName: string;
  inspectionDate: string;
  engineerName: string;
  locations: OfflineSnagLocation[];
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
}

export interface OfflineSnagLocation {
  id: string;
  location: string;
  description: string;
  photos: OfflineSnagPhoto[];
}

export interface OfflineSnagPhoto {
  id: string;
  blob: Blob | null;
  preview: string;
  annotatedPreview?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveInspection(data: OfflineInspection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ ...data, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getInspection(id: string): Promise<OfflineInspection | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteInspection(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllInspections(): Promise<OfflineInspection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function getDraftInspections(): Promise<OfflineInspection[]> {
  const all = await getAllInspections();
  return all.filter((i) => i.status === "draft");
}
