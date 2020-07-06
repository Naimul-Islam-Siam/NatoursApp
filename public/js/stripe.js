import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
   const stripe = Stripe('pk_test_51H1x30Dg9d6yaN3KTO1Qmhug4XBa3S5lWaqL3KGyA9Mv22Aqyqi599tKc9JAS25SJotpVIc6GGQixpUL34ihGdET00JJFzWeQB');

   try {
      // 1) Get checkout session from server
      const session = await axios({
         method: 'GET',
         url: `http://127.0.0.1:8080/api/v1/bookings/checkout-session/${tourId}`
      });
      console.log(session);

      // 2) Create checkout form + credit card
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id
      });
   } catch (error) {
      console.log(error);
      showAlert('error', error);
   }
};