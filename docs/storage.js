const DB_NAME = 'liftlog-local-v1';
let db;
export function openStore() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('state');
    req.onsuccess = () => { db = req.result; db.onversionchange = () => db.close(); resolve(); };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('数据库被其他页面占用，请关闭其他练记页面后重试'));
  });
}
export function loadState() {
  return new Promise((resolve, reject) => { const req = db.transaction('state').objectStore('state').get('current'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
}
export function saveState(state) {
  return new Promise((resolve, reject) => { const tx = db.transaction('state', 'readwrite'); tx.objectStore('state').put(state, 'current'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('保存被中断')); });
}
