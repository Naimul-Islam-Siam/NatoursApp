import axios from 'axios';
import { showAlert } from './alerts';

export const resetPassword = async (resetToken, password, passwordConfirm) => {
   try {
      const result = await axios({
         method: 'PATCH',
         url: `/api/v1/users/resetPassword/${resetToken}`,
         data: {
            password,
            passwordConfirm
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'New Password is Set');
         window.setTimeout(() => {
            location.assign('/');
         }, 2500);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};