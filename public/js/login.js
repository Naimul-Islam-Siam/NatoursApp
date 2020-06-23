const login = async (email, password) => {
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
         // alert('Logged In Successfully');
         window.setTimeout(() => {
            location.assign('/');
         }, 1000);
      }
   } catch (error) {
      alert(error.response.data.message);
   }
};

document.querySelector('.form').addEventListener('submit', e => {
   e.preventDefault();

   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   login(email, password);
});