import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
   try {
      const result = await axios({
         method: 'POST',
         url: '/api/v1/users/signup',
         data: {
            name,
            email,
            password,
            passwordConfirm
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Check your email to verify the account.');
         window.setTimeout(() => {
            location.assign('/verify');
         }, 2000);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};