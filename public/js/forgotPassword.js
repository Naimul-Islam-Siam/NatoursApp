import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPassword = async (email) => {
   try {
      const result = await axios({
         method: 'POST',
         url: 'http://127.0.0.1:8080/api/v1/users/forgotPassword',
         data: {
            email
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Check your Email');
         window.setTimeout(() => {
            location.assign('/reset-password');
         }, 3500);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};