const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

// HASHING CON BCRYPT
const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// MIDDLEWARE  
const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensaje: 'Token requerido' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Formato inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
};

app.get('/', (req, res) => {
    res.json({ mensaje: 'API funcionando correctamente' });
});

// REGISTER
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const existe = await pool.query(
            'SELECT * FROM api_users WHERE email = $1',
            [email]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        const hashedPassword = await hashPassword(password);

        await pool.query(
            `INSERT INTO api_users(email, password)
             VALUES($1,$2)`,
            [email, hashedPassword]
        );

        res.json({ mensaje: 'Usuario registrado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Datos incompletos' });
        }

        const result = await pool.query(
            'SELECT * FROM api_users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        const validPassword = await comparePassword(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ mensaje: 'Login exitoso', token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
