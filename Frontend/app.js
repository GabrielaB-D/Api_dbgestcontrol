const API = "http://localhost:3000";

const app = document.getElementById("app");
const authDiv = document.getElementById("auth");
const menu = document.getElementById("menu");


// TOKEN


const getToken = () => localStorage.getItem("token");



function verificarTokenExpirado() {

    const token = getToken();

    if (!token) return;

    try {

        const payload = JSON.parse(atob(token.split('.')[1]));

        if (Date.now() >= payload.exp * 1000) {

            alert("Sesión expirada");

            logout();
        }

    } catch (error) {

        logout();

    }
}


// FETCH AUTH


async function authFetch(url, options = {}) {

    verificarTokenExpirado();

    const token = getToken();

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        }
    });
}


// DARK MODE


function toggleDarkMode() {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("darkMode", isDark);

    const btn = document.querySelector(".icon-btn");

    if (btn) {
        btn.textContent = isDark ? "☀️" : "🌙";
    }
}

function cargarTema() {

    const dark = localStorage.getItem("darkMode") === "true";

    if (dark) {
        document.body.classList.add("dark");
    }

    const btn = document.querySelector(".icon-btn");

    if (btn) {
        btn.textContent = dark ? "☀️" : "🌙";
    }
}


// USER


function mostrarUsuario() {

    const token = getToken();

    if (!token) return;

    try {

        const payload = JSON.parse(atob(token.split('.')[1]));

        document.getElementById("userEmail").textContent =
            `👤 ${payload.email}`;

    } catch (error) {

        console.log(error);

    }
}


// AUTH UI


function mostrarAuth() {

    menu.style.display = "none";

    document.getElementById("userEmail").textContent = "";

    app.innerHTML = "";

    authDiv.innerHTML = `

    <div class="login-card">

        <h2> Login</h2>

        <input id="email" placeholder="Email">

        <input id="password" type="password" placeholder="Password">

        <div class="auth-buttons">
            <button onclick="login()">Login</button>
            <button onclick="register()">Register</button>
        </div>

    </div>
    `;
}

function mostrarApp() {

    authDiv.innerHTML = "";

    menu.style.display = "flex";

    mostrarUsuario();

    cargarEstudiantes();
}


// LOGIN


async function login() {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    try {

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        const data = await res.json();

        if (data.token) {

            localStorage.setItem("token", data.token);

            mostrarApp();

        } else {

            alert(data.mensaje || "Credenciales incorrectas");

        }

    } catch (error) {

        alert("Error de conexión");

    }
}


// REGISTER


async function register() {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    try {

        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value
            })
        });

        const data = await res.json();

        if (res.ok) {

            alert("Usuario creado correctamente");

        } else {

            alert(data.error || data.mensaje);

        }

    } catch (error) {

        alert("Error al registrar");

    }
}


// LOGOUT


function logout() {

    localStorage.removeItem("token");

    app.innerHTML = "";

    authDiv.innerHTML = "";

    menu.style.display = "none";

    document.getElementById("userEmail").textContent = "";

    mostrarAuth();
}


// ESTUDIANTES


async function cargarEstudiantes() {

    const res = await fetch(`${API}/estudiantes`);

    const data = await res.json();

    let html = `

    <div class="card">

    <h2>Estudiantes</h2>

    <form id="formEst">

    <input id="nombre" placeholder="Nombre" required>

    <input id="apellido" placeholder="Apellido">

    <input id="edad" type="number" placeholder="Edad">

    <input id="grado" placeholder="Grado">

    <button>Guardar</button>

    </form>

    <table>

    <tr>
    <th>ID</th>
    <th>Nombre</th>
    <th>Edad</th>
    <th>Grado</th>
    <th>Acción</th>
    </tr>
    `;

    data.forEach(e => {

        html += `
        <tr>
        <td>${e.id_estudiante}</td>
        <td>${e.nombre} ${e.apellido}</td>
        <td>${e.edad}</td>
        <td>${e.grado}</td>
        <td>
        <button onclick="eliminarEst(${e.id_estudiante})">
        Eliminar
        </button>
        </td>
        </tr>
        `;
    });

    html += `</table></div>`;

    app.innerHTML = html;

    document.getElementById("formEst").onsubmit = async e => {

        e.preventDefault();

        await authFetch(`${API}/estudiantes`, {
            method: "POST",
            body: JSON.stringify({
                nombre: nombre.value,
                apellido: apellido.value,
                edad: edad.value,
                grado: grado.value
            })
        });

        cargarEstudiantes();
    };
}

async function eliminarEst(id) {

    await authFetch(`${API}/estudiantes/${id}`, {
        method: "DELETE"
    });

    cargarEstudiantes();
}


// PROFESORES


async function cargarProfesores() {

    const res = await fetch(`${API}/profesores`);

    const data = await res.json();

    let html = `

    <div class="card">

    <h2>Profesores</h2>

    <form id="formProf">

    <input id="nombre" placeholder="Nombre">

    <input id="apellido" placeholder="Apellido">

    <input id="edad" type="number" placeholder="Edad">

    <button>Guardar</button>

    </form>

    <table>

    <tr>
    <th>ID</th>
    <th>Nombre</th>
    <th>Edad</th>
    <th>Acción</th>
    </tr>
    `;

    data.forEach(p => {

        html += `
        <tr>
        <td>${p.id_profesor}</td>
        <td>${p.nombre} ${p.apellido}</td>
        <td>${p.edad}</td>
        <td>
        <button onclick="eliminarProf(${p.id_profesor})">
        Eliminar
        </button>
        </td>
        </tr>
        `;
    });

    html += `</table></div>`;

    app.innerHTML = html;

    document.getElementById("formProf").onsubmit = async e => {

        e.preventDefault();

        await authFetch(`${API}/profesores`, {
            method: "POST",
            body: JSON.stringify({
                nombre: nombre.value,
                apellido: apellido.value,
                edad: edad.value
            })
        });

        cargarProfesores();
    };
}

async function eliminarProf(id) {

    await authFetch(`${API}/profesores/${id}`, {
        method: "DELETE"
    });

    cargarProfesores();
}


// CURSOS


async function cargarCursos() {

    const cursos = await (await fetch(`${API}/cursos`)).json();

    const horarios = await (await fetch(`${API}/horarios`)).json();

    let opciones = "";

    const mapa = {};

    horarios.forEach(h => {

        mapa[h.id_horario] = h.franja;

        opciones += `
        <option value="${h.id_horario}">
        ${h.franja}
        </option>
        `;
    });

    let html = `

    <div class="card">

    <h2>Cursos</h2>

    <form id="formCurso">

    <input id="nombreC" placeholder="Nombre">

    <textarea id="descripcion" placeholder="Descripción"></textarea>

    <select id="horario">
    ${opciones}
    </select>

    <button>Guardar</button>

    </form>

    <table>

    <tr>
    <th>Curso</th>
    <th>Horario</th>
    <th>Acción</th>
    </tr>
    `;

    cursos.forEach(c => {

        html += `
        <tr>
        <td>${c.nombre}</td>
        <td>${mapa[c.id_horario]}</td>
        <td>
        <button onclick="eliminarCurso(${c.id_curso})">
        Eliminar
        </button>
        </td>
        </tr>
        `;
    });

    html += `</table></div>`;

    app.innerHTML = html;

    document.getElementById("formCurso").onsubmit = async e => {

        e.preventDefault();

        await authFetch(`${API}/cursos`, {
            method: "POST",
            body: JSON.stringify({
                nombre: nombreC.value,
                descripcion: descripcion.value,
                id_horario: horario.value
            })
        });

        cargarCursos();
    };
}

async function eliminarCurso(id) {

    await authFetch(`${API}/cursos/${id}`, {
        method: "DELETE"
    });

    cargarCursos();
}


// MATRICULAS


async function cargarMatriculas() {

    const estudiantes =
        await (await fetch(`${API}/estudiantes`)).json();

    const profesores =
        await (await fetch(`${API}/profesores`)).json();

    const cursos =
        await (await fetch(`${API}/cursos`)).json();

    const matriculas =
        await (await fetch(`${API}/matriculas`)).json();

    let html = `

    <div class="card">

    <h2>Matrículas</h2>

    <form id="formMat">

    <select id="est">
    ${estudiantes.map(e =>
        `<option value="${e.id_estudiante}">
        ${e.nombre}
        </option>`).join("")}
    </select>

    <select id="prof">
    ${profesores.map(p =>
        `<option value="${p.id_profesor}">
        ${p.nombre}
        </option>`).join("")}
    </select>

    <select id="cur">
    ${cursos.map(c =>
        `<option value="${c.id_curso}">
        ${c.nombre}
        </option>`).join("")}
    </select>

    <button>Matricular</button>

    </form>

    <table>

    <tr>
    <th>ID</th>
    <th>Estudiante</th>
    <th>Curso</th>
    <th>Acción</th>
    </tr>
    `;

    matriculas.forEach(m => {

        html += `
        <tr>
        <td>${m.id_matricula}</td>
        <td>${m.estudiante}</td>
        <td>${m.curso}</td>
        <td>
        <button onclick="eliminarMat(${m.id_matricula})">
        Eliminar
        </button>
        </td>
        </tr>
        `;
    });

    html += `</table></div>`;

    app.innerHTML = html;

    document.getElementById("formMat").onsubmit = async e => {

        e.preventDefault();

        await authFetch(`${API}/matriculas`, {
            method: "POST",
            body: JSON.stringify({
                id_estudiante: est.value,
                id_profesor: prof.value,
                id_curso: cur.value
            })
        });

        cargarMatriculas();
    };
}

async function eliminarMat(id) {

    await authFetch(`${API}/matriculas/${id}`, {
        method: "DELETE"
    });

    cargarMatriculas();
}


// INIT


cargarTema();

if (getToken()) {

    verificarTokenExpirado();

    mostrarApp();

} else {

    mostrarAuth();
}