import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const loginForm = document.querySelector('#form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('#form--signup');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
   loginForm.addEventListener('submit', async e => {
      e.preventDefault();

      e.submitter.style.filter = 'brightness(70%)';
      e.submitter.disabled = true;
      e.submitter.style.cursor = 'not-allowed';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      await login(email, password);

      e.submitter.style.filter = 'brightness(100%)';
      e.submitter.disabled = false;
      e.submitter.style.cursor = 'pointer';
   });
}

if (logoutBtn) {
   logoutBtn.addEventListener('click', logout);
}


if (signupForm) {
   signupForm.addEventListener('submit', async e => {
      e.preventDefault();

      e.submitter.style.filter = 'brightness(70%)';
      e.submitter.disabled = true;
      e.submitter.style.cursor = 'not-allowed';

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await signup(name, email, password, passwordConfirm);

      e.submitter.style.filter = 'brightness(100%)';
      e.submitter.disabled = false;
      e.submitter.style.cursor = 'pointer';
   });
}

if (userDataForm) {
   userDataForm.addEventListener('submit', async e => {
      e.preventDefault();

      e.submitter.textContent = 'Updating...';
      e.submitter.style.filter = 'brightness(70%)';
      e.submitter.disabled = true;
      e.submitter.style.cursor = 'not-allowed';

      const form = new FormData();

      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      await updateSettings(form, 'data');

      e.submitter.textContent = 'Save Settings';
      e.submitter.style.filter = 'brightness(100%)';
      e.submitter.disabled = false;
      e.submitter.style.cursor = 'pointer';
   });
}

if (userPasswordForm) {
   userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';
      document.querySelector('.btn--save-password').style.filter = 'brightness(70%)';
      document.querySelector('.btn--save-password').disabled = true;
      document.querySelector('.btn--save-password').style.cursor = 'not-allowed';

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

      document.querySelector('.btn--save-password').textContent = 'Save Password';
      document.querySelector('.btn--save-password').style.filter = 'brightness(100%)';
      document.querySelector('.btn--save-password').disabled = false;
      document.querySelector('.btn--save-password').style.cursor = 'pointer';

      // clear the fields
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
   });
}

if (bookBtn) {
   bookBtn.addEventListener('click', async e => {
      e.target.textContent = 'Processing...';
      e.target.style.filter = 'brightness(70%)';
      e.target.disabled = true;
      e.target.style.cursor = 'not-allowed';

      const { tourId } = e.target.dataset;
      await bookTour(tourId);

      e.target.textContent = 'Book tour now!';
      e.target.style.filter = 'brightness(100%)';
      e.target.disabled = false;
      e.target.style.cursor = 'pointer';
   });
}