export interface NoteAttachment {
  id: string;
  noteId: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  createdAt: string;
}

const DB_NAME = 'prep-os-notes-attachments';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (_e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('noteId', 'noteId', { unique: false });
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function addAttachment(attachment: Omit<NoteAttachment, 'createdAt'>): Promise<NoteAttachment> {
  const db = await initDB();
  const fullAttachment: NoteAttachment = {
    ...attachment,
    createdAt: new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(fullAttachment);
    
    req.onsuccess = () => {
      resolve(fullAttachment);
    };
    
    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function getAttachmentsByNoteId(noteId: string): Promise<NoteAttachment[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('noteId');
    const req = index.getAll(noteId);
    
    req.onsuccess = () => {
      resolve(req.result || []);
    };
    
    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    
    req.onsuccess = () => {
      resolve();
    };
    
    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function deleteAttachmentsByNoteId(noteId: string): Promise<void> {
  const db = await initDB();
  const attachments = await getAttachmentsByNoteId(noteId);
  if (attachments.length === 0) return;
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    attachments.forEach((att) => {
      store.delete(att.id);
    });
    
    tx.oncomplete = () => {
      resolve();
    };
    
    tx.onerror = () => {
      reject(tx.error);
    };
  });
}
