import axios from 'axios';
import { showAlert } from './alerts';

export const verify = async (token) => {
   try {
      const result = await axios({
         method: 'POST',
         url: `http://127.0.0.1:8080/api/v1/users/accountConfirm/${token}`,
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Account is verified');
         window.setTimeout(() => {
            location.assign('/');
         }, 1000);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};