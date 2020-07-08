import axios from 'axios';
import { showAlert } from './alerts';
import { logout } from './login';

export const deactivate = async () => {
   try {
      const result = await axios({
         method: 'DELETE',
         url: 'http://127.0.0.1:8080/api/v1/users/deactivateMe'
      });

      showAlert('success', 'Account is Deactivated');
      logout();

      // if (result.data.status === 'success') {
      //    showAlert('success', 'Account is Deactivated');
      //    logout();
      //    // window.setTimeout(() => {
      //    //    location.assign('/');
      //    // }, 1000);
      // }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};
