import Api from '../../networks/api';
import Auth from '../../utils/auth';
import idbHelper from '../../data/idb-helper';
import Swal from 'sweetalert2';

const LoginPage = {
  async render() {
    return `
      <section class="auth-section">
        <div class="auth-card">
          <h1>Welcome Back</h1>
          <p>Sign in to Tobingstory</p>
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" placeholder="Enter your email" />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required autocomplete="current-password" placeholder="Enter your password" minlength="8" />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Log In</button>
            <p class="auth-link">Don't have an account? <a href="#/register">Register here</a></p>
          </form>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const loginForm = document.querySelector('#loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      Swal.fire({
        title: 'Authenticating...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const result = await Api.login({ email, password });
        Auth.setToken(result.token);
        await idbHelper.setToken(result.token);
        
        Swal.fire({
          icon: 'success',
          title: 'Login successful',
          text: `Welcome, ${result.name}!`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          location.hash = '#/';
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: error.message,
        });
      }
    });
  },
};

export default LoginPage;
