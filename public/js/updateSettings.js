import axios from 'axios';
import { showAlert } from './alerts';

// data is an object
// type is either `password` or `data`
export const updateSettings = async (data, type) => {
   try {
      const url = type === 'password' ? 'http://127.0.0.1:8080/api/v1/users/updatePassword' : 'http://127.0.0.1:8080/api/v1/users/updateMe'

      const result = await axios({
         method: 'PATCH',
         url,
         data
      });

      if (result.data.status === 'success') {
         showAlert('success', `${type.toUpperCase()} Updated successfully`);
         // window.setTimeout(() => {
         //    location.assign('/');
         // }, 1000);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};