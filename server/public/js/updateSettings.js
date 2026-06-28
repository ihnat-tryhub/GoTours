/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      //   url: 'http://127.0.0.1:3000/api/v1/users/login',
      url,
      data,
    });

    if (res.data.status == 'success') {
      showAlert('success', `${type} updated successfully!`);
    }
    console.log('success');
    console.log(res);
  } catch (err) {
    console.log('failure');

    showAlert('error', err.response.data.message);
  }
};
