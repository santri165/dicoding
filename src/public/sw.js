const CACHE_NAME = 'tobingstory-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
  '/styles/styles.css',
  '/scripts/index.js',
];

const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin API requests to avoid CORS preflight caching bugs
  if (event.request.url.includes('story-api.dicoding.dev')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Background Sync Handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-add-story') {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  const db = await openIDB();
  const stories = await getAllFromStore(db, 'sync-stories');
  const token = await getFromStore(db, 'auth', 'token');

  if (!token) return;

  for (const story of stories) {
    try {
      await uploadStory(story, token);
      await deleteFromStore(db, 'sync-stories', story.id);
    } catch (err) {
      console.error('Failed to sync story:', err);
    }
  }
}

async function uploadStory(story, token) {
  const formData = new FormData();
  formData.append('description', story.description);
  formData.append('photo', story.photo, 'offline-capture.jpg');
  if (story.lat) formData.append('lat', story.lat);
  if (story.lon) formData.append('lon', story.lon);

  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed with status ' + response.status);
  }
}

// Minimal IDB helper for SW (no ES modules)
function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tobingstory-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push Notification
self.addEventListener('push', (event) => {
  let data = { title: 'Tobingstory', content: 'You have a new story update.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Tobingstory', content: event.data.text() };
    }
  }

  const options = {
    body: data.content || data.body || 'New story added!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View Detail' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL('/#/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
