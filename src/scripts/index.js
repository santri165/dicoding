// CSS imports
import '../styles/styles.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  // Cinematic fade in to prevent raw HTML text flash 
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    document.body.style.opacity = '1';
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Service Worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered: ', registration);
      }).catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
});
