import { openDB } from 'idb';

const DATABASE_NAME = 'tobingstory-db';
const DATABASE_VERSION = 2;
const STORE_NAME_STORIES = 'stories';
const STORE_NAME_SYNC = 'sync-stories';
const STORE_NAME_SAVED = 'saved-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME_STORIES)) {
      db.createObjectStore(STORE_NAME_STORIES, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_NAME_SYNC)) {
      db.createObjectStore(STORE_NAME_SYNC, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('auth')) {
      db.createObjectStore('auth');
    }
    if (!db.objectStoreNames.contains(STORE_NAME_SAVED)) {
      db.createObjectStore(STORE_NAME_SAVED, { keyPath: 'id' });
    }
  },
});

const idbHelper = {
  async getStory(id) {
    return (await dbPromise).get(STORE_NAME_STORIES, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME_STORIES);
  },

  async putStory(story) {
    return (await dbPromise).put(STORE_NAME_STORIES, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(STORE_NAME_STORIES, id);
  },

  // For Background Sync
  async getAllSyncStories() {
    return (await dbPromise).getAll(STORE_NAME_SYNC);
  },

  async putSyncStory(story) {
    return (await dbPromise).add(STORE_NAME_SYNC, story);
  },

  async deleteSyncStory(id) {
    return (await dbPromise).delete(STORE_NAME_SYNC, id);
  },
  
  async clearSyncStories() {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME_SYNC, 'readwrite');
    await tx.store.clear();
    await tx.done;
  },

  // For Saved/Favorite Stories
  async getAllSavedStories() {
    return (await dbPromise).getAll(STORE_NAME_SAVED);
  },

  async putSavedStory(story) {
    return (await dbPromise).put(STORE_NAME_SAVED, story);
  },

  async deleteSavedStory(id) {
    return (await dbPromise).delete(STORE_NAME_SAVED, id);
  },

  async setToken(token) {
    return (await dbPromise).put('auth', token, 'token');
  },

  async getToken() {
    return (await dbPromise).get('auth', 'token');
  }
};

export default idbHelper;
