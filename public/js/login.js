/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      //   url: 'http://127.0.0.1:3000/api/v1/users/login',
      url: '/api/v1/users/login',

      data: {
        email,
        password,
      },
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log('success');
    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      //   url: 'http://127.0.0.1:3000/api/v1/users/signup',
      url: '/api/v1/users/signup',

      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Signup successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log('success');
    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status == 'success') {
      showAlert('success', 'Logout successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const forgot = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      baseURL: '', // Переопределяем baseURL для этого запроса, оставляем его пустым

      url: 'api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status == 'success') {
      console.log('sgsfdjasdli');
      showAlert('success', 'Link was sent to the email');
    }
  } catch (err) {
    console.log(err);
    console.log(err.message);
    showAlert('error', 'Error reset password! Try again.');
  }
  // url: 'https://gotours.onrender.com/login/forgotPassword
  // url: 'https://gotours.onrender.com/api/v1/users/forgotPassword
  // url: 'https://gotours.onrender.com

  // POST https://gotours.onrender.com/api/v1/users/forgotPassword 500
};

export const reset = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'patch',
      baseURL: '', // Переопределяем baseURL для этого запроса, оставляем его пустым
      url: `/api/v1/users/resetPassword/${token}`, // Путь будет относительным
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status == 'success') {
      showAlert('success', 'Reset successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error reset password!! Try again.');
  }
};
