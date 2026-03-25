const Auth = {
  USER_TOKEN_KEY: 'userToken',

  getToken() {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(this.USER_TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(this.USER_TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};

export default Auth;
