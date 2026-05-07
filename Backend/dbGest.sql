
-- TABLA USUARIOS 

CREATE TABLE api_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TABLA HORARIOS

CREATE TABLE horarios(
	id_horario SERIAL PRIMARY KEY,
	franja VARCHAR(50)
);


-- TABLA PROFESORES

CREATE TABLE profesores(
	id_profesor SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	apellido VARCHAR(100) NOT NULL,
	edad INT
);


-- TABLA ESTUDIANTES

CREATE TABLE estudiantes(
	id_estudiante SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	apellido VARCHAR(100),
	edad INT,
	grado VARCHAR(20)
);


-- TABLA CURSOS

CREATE TABLE cursos(
	id_curso SERIAL PRIMARY KEY,
	id_horario INT,
	nombre VARCHAR(100) NOT NULL,
	descripcion TEXT,
	CONSTRAINT fk_horario 
	FOREIGN KEY (id_horario) 
	REFERENCES horarios(id_horario) 
	ON DELETE SET NULL
);


-- TABLA MATRICULAS

CREATE TABLE matriculas (
	id_matricula SERIAL PRIMARY KEY,
	id_estudiante INT, 
	id_profesor INT,
	id_curso INT,
	CONSTRAINT fk_profesor 
	FOREIGN KEY (id_profesor) 
	REFERENCES profesores(id_profesor) 
	ON DELETE SET NULL,
	CONSTRAINT fk_estudiante 
	FOREIGN KEY (id_estudiante) 
	REFERENCES estudiantes(id_estudiante),
	CONSTRAINT fk_curso 
	FOREIGN KEY (id_curso) 
	REFERENCES cursos(id_curso)
);


-- INSERTS


INSERT INTO horarios (franja) VALUES 
('Diurno'),
('Nocturno');

INSERT INTO profesores (nombre, apellido, edad) VALUES
('Carlos', 'Ramirez', 45),
('Ana', 'Lopez', 38),
('Luis', 'Gonzalez', 50),
('Maria', 'Fernandez', 29);

INSERT INTO estudiantes (nombre, apellido, edad, grado) VALUES
('Juan', 'Perez', 16, '10mo'),
('Sofia', 'Martinez', 17, '11mo'),
('Diego', 'Hernandez', 15, '9no'),
('Valeria', 'Castro', 18, '12mo');

INSERT INTO cursos (id_horario, nombre, descripcion) VALUES
(1, 'Matematicas', 'Curso basico de matematicas'),
(1, 'Ingles', 'Curso de ingles intermedio'),
(2, 'Programacion', 'Introduccion a la programacion'),
(2, 'Redes', 'Conceptos basicos de redes');

INSERT INTO matriculas (id_estudiante, id_profesor, id_curso) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4);