const API_URL = 'http://localhost:3000';

document
  .getElementById('loginForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
      } else {
        alert(data.error || "Error al iniciar sesión");
      }

    } catch (error) {
      console.error("Error en la conexión con el servidor: " + error);
    }
  });