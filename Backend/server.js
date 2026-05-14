//lo primero es importar las librerias
require('dotenv').config();//Cargar la libreria dotenv -> crear archivos .env
const bcrypt = require('bcrypt');//Cargar la libreria bcrypt -> Crear hashes de las passwords
const jwt = require('jsonwebtoken');//Cargar la libreria JWT -> Firmar los Tokens de auth
const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');

//inicializar la app
const app = express();

//middleware para devolver la informacion en JSON
app.use(express.json());

//middleware para aceptar solicitudes externas
app.use(cors());

//vamos a hacer la conexion de datos

const pool = new Pool({ 
    user: process.env.DB_USER, 
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME, 
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT
});

//--- RUTAS DE AUTENTICACIÓN ---
//REGISTRO
app.post('/auth/register', async (req,res)=>{
    try {
        const {email,password}=req.body;
        //Generar Hash de contraseña
        const saltRounds = 10;//Decirle a bcrypt que ejecute 2^10 veces el algoritmo no paralelizable
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //Guardar nuevo usuario en la BD
        const result = await pool.query('INSERT INTO api_users (email,password) VALUES ($1, $2) RETURNING id, email, creation_date',
            [email, hashedPassword]
        );
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        if(error.code === '23505'){
            return res.status(400).json({error: "El email ya está en uso por otro usuario"+error.message});
        }
        res.status(500).json({error:"No se ha podido registrar en usuario: "+error.message})
    }
});

//LOGIN
app.post('/auth/login',async (req,res)=>{
    try {
        const {email, password} = req.body;
        //Obtenemos el usuario con el email de la BD
        const result = await pool.query('SELECT * FROM api_users WHERE email = $1',[email]);
        //Vrificar si el usuario existe en la BD
        if(result.rows.length === 0){
            return res.status(401).json({error: "Credenciales Incorrectas"});
        }
        const usuario = result.rows[0];
        //Verificamos con BCRYPT que la contraseña es la misma
        const esValida = await bcrypt.compare(password, usuario.password);
        if(!esValida){
            return res.status(401).json({error: "Credenciales Incorrectas"});
        }
        //Creación del JWT firmado
        const token = jwt.sign({id: usuario.id},process.env.JWT_SECRET,{expiresIn: '2h'});
        //Devolvemos el token al usuario
        res.json({token});
    } catch (error) {
        res.status(500).json({error:"No se pudo iniciar sesión: "+error.message});
    }
});


//--- MIDDLEWARE DE AUTENTICACIÓN ---
const verificarToken = (req,res,next)=>{
    //Extraer el token de el header del request
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({error: "Acceso denegado, Se requiere token de autentificación."});
    }
    try {
        //Validar el token de autentificación
        const verificado = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (error) {
        res.status(401).json({error: "Token no validado correctamente: "+error.message});
    }
};




//--- RUTAS GESTOR DE CURSOS --- 

//aviso de funcionamiento del API
app.get('/', async(req,res) => {
    try {
        res.json({mensaje: 'Api funcionando correctamente!'});
    } catch (error) {
        
    }
});

//  ESTUDIANTES 

// Obtener estudiantes
app.get('/estudiantes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM estudiantes'
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Crear estudiante
app.post('/estudiantes', verificarToken, async (req, res) => {
    try {
        const { nombre, apellido, edad, grado } = req.body;

        const result = await pool.query(
            `INSERT INTO estudiantes
            (nombre, apellido, edad, grado)
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
            [nombre, apellido, edad, grado]
        );

        res.json({
            mensaje: 'Estudiante agregado correctamente',
            estudiante: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Eliminar estudiante
app.delete('/estudiantes/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM estudiantes WHERE id_estudiante = $1',
            [id]
        );

        res.json({ mensaje: 'Estudiante eliminado' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  PROFESORES 

app.get('/profesores', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM profesores'
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/profesores', verificarToken, async (req, res) => {
    try {
        const { nombre, apellido, edad } = req.body;

        const result = await pool.query(
            `INSERT INTO profesores
            (nombre, apellido, edad)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [nombre, apellido, edad]
        );

        res.json({
            mensaje: 'Profesor agregado correctamente',
            profesor: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/profesores/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM profesores WHERE id_profesor=$1',
            [id]
        );

        res.json({ mensaje: 'Profesor eliminado' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  CURSOS 

app.get('/cursos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cursos'
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/cursos', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion, id_horario } = req.body;

        const result = await pool.query(
            `INSERT INTO cursos
            (nombre, descripcion, id_horario)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [nombre, descripcion, id_horario]
        );

        res.json({
            mensaje: 'Curso agregado',
            curso: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/cursos/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM cursos WHERE id_curso=$1',
            [id]
        );

        res.json({ mensaje: 'Curso eliminado' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  MATRICULAS 

app.get('/matriculas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id_matricula,
                   e.nombre AS estudiante,
                   c.nombre AS curso
            FROM matriculas m
            JOIN estudiantes e ON m.id_estudiante = e.id_estudiante
            JOIN cursos c ON m.id_curso = c.id_curso
        `);

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/matriculas', verificarToken, async (req, res) => {
    try {
        const { id_estudiante, id_profesor, id_curso } = req.body;

        const result = await pool.query(
            `INSERT INTO matriculas
            (id_estudiante,id_profesor,id_curso)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [id_estudiante, id_profesor, id_curso]
        );

        res.json({
            mensaje: 'Matrícula creada',
            matricula: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/matriculas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM matriculas WHERE id_matricula=$1',
            [id]
        );

        res.json({ mensaje: 'Matrícula eliminada' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//para probar el api vamos a arrancar el servidor
app.listen(3000, () => {
    console.log('servidor corriendo en la ruta http://localhost:3000');
});
