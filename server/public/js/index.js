/* eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup, reset, forgot } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const resetPasswordForm = document.querySelector('.form--reset');

const logOutBtn = document.querySelector('.nav__el--logout');
const forgotBtn = document.querySelector('#forgotBtn');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const logoHeader = document.getElementById('logoHeader');
const logoFooter = document.getElementById('logoFooter');
const saveSettingsBtn = document.getElementById('saveSettings');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  console.log('login form is here');
  const forgotText = document.querySelector('#forgotText');

  forgotText.addEventListener('click', (e) => {
    console.log(123);

    const email = document.getElementById('email').value;

    forgot(email);
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (signupForm) {
  console.log('signup form is here');
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // VALUES
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    console.log('signup');
    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords must be same');
    } else {
      console.log('signup in progress');

      signup(name, email, password, passwordConfirm);
    }
  });
}

if (resetPasswordForm) {
  const token = window.location.pathname.split('/').pop();
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // VALUES
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords must be same');
    } else {
      reset(password, passwordConfirm, token);
    }
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  forgotBtn.addEventListener('click', (e) => {
    const email = document.getElementById('email').value;
    console.log(email);
    forgot(email);
  });

  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').value = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    document.querySelector('.btn--save-password').value = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (logoHeader && logoFooter) {
  logoHeader.addEventListener('click', () => {
    window.location.href = '/'; // Переход на главную страницу
  });
  logoFooter.addEventListener('click', () => {
    window.location.href = '/'; // Переход на главную страницу
  });
}

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    location.reload();
  });
}
