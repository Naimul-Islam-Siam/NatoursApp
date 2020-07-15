export const showAlert = (type, message, time = 5) => {
   hideAlert();
   // type is either 'success' or 'error'
   const markup = `<div class="alert alert--${type}">${message}</div>`;

   document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

   window.setTimeout(hideAlert, time * 1000);
};

export const hideAlert = () => {
   const element = document.querySelector('.alert');
   if (element) {
      element.parentElement.removeChild(element);
   }
};