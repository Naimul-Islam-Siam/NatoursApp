import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (name, email) => {
   try {
      const result = await axios({
         method: 'PATCH',
         url: 'http://127.0.0.1:8080/api/v1/users/updateMe',
         data: {
            name,
            email
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Data Updated successfully');
         // window.setTimeout(() => {
         //    location.assign('/');
         // }, 1000);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};