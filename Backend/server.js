const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(cors());




const SECRET_KEY = "vi4d6r6561a5d6fuvtde5swa3z6cy";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ClassGestDB',
    password: '12345678',
    port: 5432
});



const validarTexto = (texto) => {
    return typeof texto === 'string' && texto.trim().length > 0;
};

const hashPassword = (password) => {
    return crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
};


// MIDDLEWARE 


const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensaje: 'Token requerido'
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'Formato inválido'
        });
    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            mensaje: 'Token inválido'
        });
    }
};




app.get('/', (req, res) => {
    res.json({
        mensaje: 'API funcionando correctamente'
    });
});


// REGISTER


app.post('/register', async (req, res) => {

    try {

        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Datos incompletos'
            });
        }

        const existe = await pool.query(
            'SELECT * FROM api_users WHERE email = $1',
            [email]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({
                mensaje: 'El usuario ya existe'
            });
        }

        const hashedPassword = hashPassword(password);

        await pool.query(
            `INSERT INTO api_users(email, password)
             VALUES($1,$2)`,
            [email, hashedPassword]
        );

        res.json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// LOGIN


app.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Datos incompletos'
            });
        }

        const result = await pool.query(
            'SELECT * FROM api_users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            });
        }

        const user = result.rows[0];

        const hashedPassword = hashPassword(password);

        if (hashedPassword !== user.password) {
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            SECRET_KEY,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            mensaje: 'Login exitoso',
            token
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// API USERS


app.get('/api_users', authMiddleware, async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT id, email, creation_date FROM api_users'
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// ESTUDIANTES


app.get('/estudiantes', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM estudiantes'
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.get('/estudiantes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM estudiantes
             WHERE id_estudiante = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.post('/estudiantes', authMiddleware, async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            edad,
            grado
        } = req.body;

        if (!validarTexto(nombre)) {
            return res.status(400).json({
                mensaje: 'Nombre inválido'
            });
        }

        const result = await pool.query(
            `INSERT INTO estudiantes
            (nombre, apellido, edad, grado)
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
            [nombre, apellido, edad, grado]
        );

        res.json({
            mensaje: 'Estudiante creado',
            data: result.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.put('/estudiantes/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            edad,
            grado
        } = req.body;

        const result = await pool.query(
            `UPDATE estudiantes
            SET nombre=$1,
                apellido=$2,
                edad=$3,
                grado=$4
            WHERE id_estudiante=$5
            RETURNING *`,
            [nombre, apellido, edad, grado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json({
            mensaje: 'Actualizado',
            data: result.rows[0]
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.delete('/estudiantes/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM estudiantes
             WHERE id_estudiante=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json({
            mensaje: 'Eliminado correctamente'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// PROFESORES


app.get('/profesores', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM profesores'
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.post('/profesores', authMiddleware, async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            edad
        } = req.body;

        const result = await pool.query(
            `INSERT INTO profesores
            (nombre, apellido, edad)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [nombre, apellido, edad]
        );

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.delete('/profesores/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM profesores
             WHERE id_profesor=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json({
            mensaje: 'Profesor eliminado'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// CURSOS


app.get('/cursos', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM cursos'
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.post('/cursos', authMiddleware, async (req, res) => {

    try {

        const {
            id_horario,
            nombre,
            descripcion
        } = req.body;

        const result = await pool.query(
            `INSERT INTO cursos
            (id_horario, nombre, descripcion)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [id_horario, nombre, descripcion]
        );

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.delete('/cursos/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM cursos
             WHERE id_curso=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json({
            mensaje: 'Curso eliminado'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// MATRICULAS


app.get('/matriculas', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT 
                m.*,
                e.nombre AS estudiante,
                c.nombre AS curso
            FROM matriculas m
            JOIN estudiantes e
                ON m.id_estudiante = e.id_estudiante
            JOIN cursos c
                ON m.id_curso = c.id_curso
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.post('/matriculas', authMiddleware, async (req, res) => {

    try {

        const {
            id_estudiante,
            id_profesor,
            id_curso
        } = req.body;

        const result = await pool.query(
            `INSERT INTO matriculas
            (id_estudiante, id_profesor, id_curso)
            VALUES ($1,$2,$3)
            RETURNING *`,
            [id_estudiante, id_profesor, id_curso]
        );

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

app.delete('/matriculas/:id', authMiddleware, async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM matriculas
             WHERE id_matricula=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'No encontrado'
            });
        }

        res.json({
            mensaje: 'Matrícula eliminada'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});


// HORARIOS


app.get('/horarios', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM horarios'
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});



app.listen(3000, () => {
    console.log(
        'Servidor corriendo en http://localhost:3000'
    );
});