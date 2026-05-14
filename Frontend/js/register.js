const API_URL = 'http://localhost:3000';
document.getElementById ('registerForm').addEventListener ('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password!=confirmPassword){
        alert ("Las contraseñas no coinciden. Intentelo de nuevo");
        return;
    }

    try {
        const res = await fetch (API_URL+'/auth/register', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify({email, password}) 
    });

    if(res.ok){
        window.location.href ='login.html'; 
    }else{
        const data =await res.json();
        alert(data.error); 
    } 

    } catch(error) {
        console.error("Error en el registro: " + error); 

}});