const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const app = express();
const port = 3000;

// Carpeta para almacenar imágenes
const imageDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
}

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'isa',
    password: '19',
    database: 'files'
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Middleware para parsear JSON y habilitar CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());  // Usar el middleware cors

// Ruta para la subida de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const descripcion = req.body.descripcion;
    const ubicacion = req.body.ubicacion || 'No especificada';
    const fecha_hora = moment().tz("America/Mexico_City").format("YYYY-MM-DD HH:mm:ss");

    if (!file) {
        return res.status(400).send('No se ha subido ningún archivo');
    }

    const relativePath = `/uploads/${file.filename}`;
    const sql = 'INSERT INTO archivos (nombre, tipo, ruta, ubicacion, descripcion, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [file.originalname, file.mimetype, relativePath, ubicacion, descripcion, fecha_hora];

    db.query(sql, values, (err, result) => {
        if (err) throw err;
        res.send('Archivo subido y guardado en la base de datos');
    });
});

// Ruta para obtener archivos subidos
app.get('/files', (req, res) => {
    const sql = 'SELECT id, nombre, tipo, ruta, ubicacion, descripcion, fecha_hora FROM archivos';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Servir archivos estáticos
app.use('/uploads', express.static(imageDir));

// Ruta para la pantalla de visualización
app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'view.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
