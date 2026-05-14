const API_URL = 'http://localhost:3000';

//VERIFICAR TOKEN


const token = localStorage.getItem('token');

if (!token) {
    window.location.href = "login.html";
}

//FETCH CON TOKEN AUTOMÁTICO


async function authFetch(url, options = {}) {

    options.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        ...(options.headers || {})
    };

    const res = await fetch(url, options);

    if (res.status === 401) {
        alert("Sesión expirada");
        logout();
        return;
    }

    return res;
}

//ESTUDIANTES

async function obtenerEstudiantes() {

    const res = await fetch(API_URL + '/estudiantes');
    const data = await res.json();

    const lista = document.getElementById('lista-estudiantes');
    lista.innerHTML = '';

    data.forEach(e => {

        const li = document.createElement('li');

        li.innerHTML = `
            ${e.nombre} ${e.apellido} | Edad: ${e.edad} | Grado: ${e.grado}
            <button onclick="eliminarEstudiante(${e.id_estudiante})">
                Eliminar
            </button>
        `;

        lista.appendChild(li);
    });
}

async function crearEstudiante() {

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const edad = document.getElementById('edad').value;
    const grado = document.getElementById('grado').value;

    if (!nombre) return alert("Nombre vacío");

    await authFetch(API_URL + '/estudiantes', {
        method: 'POST',
        body: JSON.stringify({
            nombre,
            apellido,
            edad,
            grado
        })
    });

    obtenerEstudiantes();
}

async function eliminarEstudiante(id) {

    await authFetch(`${API_URL}/estudiantes/${id}`, {
        method: 'DELETE'
    });

    obtenerEstudiantes();
}

//PROFESORES


async function obtenerProfesores() {

    const res = await fetch(API_URL + '/profesores');
    const data = await res.json();

    const lista = document.getElementById('lista-profesores');
    lista.innerHTML = '';

    data.forEach(p => {

        const li = document.createElement('li');

        li.innerHTML = `
            ${p.nombre} ${p.apellido} | Edad: ${p.edad}
            <button onclick="eliminarProfesor(${p.id_profesor})">
                Eliminar
            </button>
        `;

        lista.appendChild(li);
    });
}

async function crearProfesor() {

    const nombre = document.getElementById('nombre-prof').value;
    const apellido = document.getElementById('apellido-prof').value;
    const edad = document.getElementById('edad-prof').value;

    await authFetch(API_URL + '/profesores', {
        method: 'POST',
        body: JSON.stringify({
            nombre,
            apellido,
            edad
        })
    });

    obtenerProfesores();
}

async function eliminarProfesor(id) {

    await authFetch(`${API_URL}/profesores/${id}`, {
        method: 'DELETE'
    });

    obtenerProfesores();
}

//CURSOS


async function obtenerCursos() {

    const res = await fetch(API_URL + '/cursos');
    const data = await res.json();

    const lista = document.getElementById('lista-cursos');
    lista.innerHTML = '';

    data.forEach(c => {

        const li = document.createElement('li');

        li.innerHTML = `
            ${c.nombre}
            <button onclick="eliminarCurso(${c.id_curso})">
                Eliminar
            </button>
        `;

        lista.appendChild(li);
    });
}

async function crearCurso() {

    const nombre = document.getElementById('nombre-curso').value;
    const descripcion = document.getElementById('descripcion').value;
    const id_horario = document.getElementById('horario').value;

    await authFetch(API_URL + '/cursos', {
        method: 'POST',
        body: JSON.stringify({
            nombre,
            descripcion,
            id_horario
        })
    });

    obtenerCursos();
}

async function eliminarCurso(id) {

    await authFetch(`${API_URL}/cursos/${id}`, {
        method: 'DELETE'
    });

    obtenerCursos();
}

//MATRÍCULAS


async function obtenerMatriculas() {

    const res = await fetch(API_URL + '/matriculas');
    const data = await res.json();

    const lista = document.getElementById('lista-matriculas');
    lista.innerHTML = '';

    data.forEach(m => {

        const li = document.createElement('li');

        li.innerHTML = `
            ${m.estudiante} → ${m.curso}
            <button onclick="eliminarMatricula(${m.id_matricula})">
                Eliminar
            </button>
        `;

        lista.appendChild(li);
    });
}

async function crearMatricula() {

    const id_estudiante = document.getElementById('est').value;
    const id_profesor = document.getElementById('prof').value;
    const id_curso = document.getElementById('cur').value;

    await authFetch(API_URL + '/matriculas', {
        method: 'POST',
        body: JSON.stringify({
            id_estudiante,
            id_profesor,
            id_curso
        })
    });

    obtenerMatriculas();
}

async function eliminarMatricula(id) {

    await authFetch(`${API_URL}/matriculas/${id}`, {
        method: 'DELETE'
    });

    obtenerMatriculas();
}

//LOGOUT


function logout() {
    localStorage.removeItem('token');
    window.location.href = "login.html";
}