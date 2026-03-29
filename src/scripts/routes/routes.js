import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/story/add-story-page';
import FavoritePage from '../pages/favorite/favorite-page';

const routes = {
  '/': HomePage,
  '/favorite': FavoritePage,
  '/about': new AboutPage(),
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add-story': AddStoryPage,
};

export default routes;
