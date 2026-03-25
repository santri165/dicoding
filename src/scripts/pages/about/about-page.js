class AboutPage {
  async render() {
    return `
      <section class="about-section">
        <header class="about-header">
          <h1>THE ARCHITECTURE.</h1>
          <p>Tobingstory was strictly engineered with uncompromising pure-JS performance and an ultra-premium Awwwards-winning spatial aesthetic.</p>
        </header>

        <div class="tech-grid">
          <div class="tech-card">
            <h2>⚡ Vite.js Engine</h2>
            <p>Harnessing the next generation of Frontend Tooling, providing microsecond Hot Module Replacements and an impossibly small production bundle.</p>
          </div>
          <div class="tech-card">
            <h2>📍 Leaflet Core</h2>
            <p>A mathematically precise mapping framework silently synchronizing global geographical markers without lagging the main browser thread.</p>
          </div>
          <div class="tech-card">
            <h2>🧠 Vanilla SPA</h2>
            <p>Forged completely from scratch without heavy DOM frameworks like React or Vue, delivering a raw, unadulterated Native hardware performance.</p>
          </div>
          <div class="tech-card">
            <h2>🎥 Canvas Stream</h2>
            <p>Integration with native hardware sensors. Transpiling live webcam streams into optimized Blob binaries locally under 1 Megabyte limits.</p>
          </div>
        </div>

        <div class="cta-section">
          <h2>Ready to make history?</h2>
          <a href="#/add-story" class="btn btn-primary">Initialize Story Sequence</a>
        </div>

        <div class="settings-section">
          <h2>Stay Notified</h2>
          <p>Enable push notifications to receive real-time updates when new stories are archived in the Tobingstory global ledger.</p>
          <div class="toggle-container">
            <span id="push-status">Notifications are currently disabled</span>
            <button id="push-toggle" class="btn btn-secondary">Enable Notifications</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Cinematic Staggered Entrance Animations (JS Driven)
    const header = document.querySelector('.about-header');
    const cards = document.querySelectorAll('.tech-card');
    const cta = document.querySelector('.cta-section');
    
    // Hide initially
    [header, ...cards, cta].forEach(el => {
      if(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
      }
    });
    
    // Stagger in
    setTimeout(() => {
      if(header) {
        header.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }
    }, 100);

    cards.forEach((card, i) => {
      setTimeout(() => {
        if(card) {
          card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ' + (i * 0.1) + 's';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }
      }, 300);
    });

    setTimeout(() => {
      if(cta) {
          cta.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          cta.style.opacity = '1';
          cta.style.transform = 'translateY(0)';
      }
    }, 800);

    this._setupPushToggle();
  }

  async _setupPushToggle() {
    const pushToggle = document.querySelector('#push-toggle');
    const pushStatus = document.querySelector('#push-status');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      pushToggle.disabled = true;
      pushStatus.textContent = 'Push notifications are not supported by your browser.';
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    const updateUI = (sub) => {
      subscription = sub;
      if (sub) {
        pushStatus.textContent = 'Notifications are enabled.';
        pushToggle.textContent = 'Disable Notifications';
        pushToggle.classList.add('active');
      } else {
        pushStatus.textContent = 'Notifications are disabled.';
        pushToggle.textContent = 'Enable Notifications';
        pushToggle.classList.remove('active');
      }
    };

    updateUI(subscription);

    pushToggle.addEventListener('click', async () => {
      try {
        if (subscription) {
          await subscription.unsubscribe();
          updateUI(null);
        } else {
          const newSub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this._urlBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'),
          });
          updateUI(newSub);
          console.log('Push Subscription:', JSON.stringify(newSub));
        }
      } catch (err) {
        console.error('Push error:', err);
        alert('Failed to update notification settings: ' + err.message);
      }
    });
  }

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default AboutPage;
