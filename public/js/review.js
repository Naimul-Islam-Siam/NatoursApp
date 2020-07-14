import axios from 'axios';
import { showAlert } from './alerts';

export const addReview = async (tourId, review, rating) => {
   try {
      const result = await axios({
         method: 'POST',
         url: `/api/v1/tours/${tourId}/reviews`,
         data: {
            review,
            rating
         }
      });

      if (result.data.status === 'success') {
         showAlert('success', 'Review Added successfully');
         window.setTimeout(() => {
            location.reload();
         }, 1000);
      }
   } catch (error) {
      showAlert('error', error.response.data.message);
   }
};