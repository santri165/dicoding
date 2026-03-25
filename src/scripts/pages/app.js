import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import Auth from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    
    // Auth Guard
    if (!Auth.isLoggedIn() && url !== '/register' && url !== '/login') {
      location.hash = '#/login';
      return;
    }
    
    // Check if logged in trying to access auth pages
    if (Auth.isLoggedIn() && (url === '/register' || url === '/login')) {
      location.hash = '#/';
      return;
    }

    const page = routes[url] || routes['/'];

    // Custom Transition setup
    const updateDOM = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      window.scrollTo(0, 0);
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => updateDOM());
    } else {
      // Fallback transition
      this.#content.style.opacity = '0';
      await updateDOM();
      this.#content.style.transition = 'opacity 0.3s ease';
      this.#content.style.opacity = '1';
    }
  }
}

export default App;
