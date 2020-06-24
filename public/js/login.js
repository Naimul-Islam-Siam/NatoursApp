import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
   console.log(`${email}, ${password}`);

   try {
      const result = await axios({
         method: 'POST',
         url: 'http://127.0.0.1:8080/api/v1/users/login',
         data: {
            email,
            password
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Logged in successfully');
         window.setTimeout(() => {
            location.assign('/');
         }, 1300);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};