// LocalStorage Save & Load system for Ani sa Nayon.
// Auto-saves upon sleeping each night; can be manually saved/loaded anytime.
const SAVE_KEY = 'ani_sa_nayon_save_v1';

export function createStorage() {
  const storage = {};

  storage.hasSave = () => {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
  };

  storage.save = (data) => {
    try {
      const payload = JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        ...data,
      });
      localStorage.setItem(SAVE_KEY, payload);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  };

  storage.load = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  };

  storage.deleteSave = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch {
      return false;
    }
  };

  return storage;
}
