import Api from '../../networks/api';
import Swal from 'sweetalert2';

const RegisterPage = {
  async render() {
    return `
      <section class="auth-section">
        <div class="auth-card">
          <h1>Create Account</h1>
          <p>Join Tobingstory</p>
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" required autocomplete="name" placeholder="Enter your full name" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" placeholder="Enter your email" />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required autocomplete="new-password" placeholder="Min 8 characters" minlength="8" />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Register</button>
            <p class="auth-link">Already have an account? <a href="#/login">Log in here</a></p>
          </form>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const registerForm = document.querySelector('#registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      Swal.fire({
        title: 'Creating Account...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        await Api.register({ name, email, password });
        
        Swal.fire({
          icon: 'success',
          title: 'Registration successful',
          text: 'You can now log in with your new account.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          location.hash = '#/login';
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: error.message,
        });
      }
    });
  },
};

export default RegisterPage;
