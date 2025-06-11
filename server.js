// importar los frameworks necesarios para ejecutar la app
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

// crear una instancia de la aplicación express
const app = express();
const PORT = 3000;

// habilitar CORS para permitir peticiones
app.use(cors());

// permite a express entender el formato JSON
app.use(bodyParser.json());

// detectar archivos estáticos en la carpeta public
app.use(express.static('public'));

// conectar a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/pasteleria', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error(err));

// Esquemas y modelos
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const PastelSchema = new mongoose.Schema({
    nombre: String,
    precio: Number
});
const Pastel = mongoose.model('Pastel', PastelSchema);

const EmpleadoSchema = new mongoose.Schema({
    nombre: String,
    rol: String
});
const Empleado = mongoose.model('Empleado', EmpleadoSchema);

const PedidoSchema = new mongoose.Schema({
    cliente: String,
    producto: String
});
const Pedido = mongoose.model('Pedido', PedidoSchema);

// Ruta de registro
app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).send('Usuario registrado');
    } catch (err) {
        res.status(500).send('Error al registrar usuario');
    }
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(401).send('Usuario no encontrado');

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) return res.status(401).send('Contraseña incorrecta');

        res.send('Bienvenido ' + usuario.nombre);
    } catch (err) {
        res.status(500).send('Error en el inicio de sesión');
    }
});

// CRUD Pasteles
app.get('/api/pasteles', async (req, res) => {
    const pasteles = await Pastel.find();
    res.json(pasteles);
});

app.post('/api/pasteles', async (req, res) => {
    const nuevo = new Pastel(req.body);
    await nuevo.save();
    res.status(201).send('Pastel creado');
});

app.delete('/api/pasteles/:id', async (req, res) => {
    await Pastel.findByIdAndDelete(req.params.id);
    res.send('Pastel eliminado');
});

// CRUD Empleados
app.get('/api/empleados', async (req, res) => {
    const empleados = await Empleado.find();
    res.json(empleados);
});

app.post('/api/empleados', async (req, res) => {
    const nuevo = new Empleado(req.body);
    await nuevo.save();
    res.status(201).send('Empleado creado');
});

app.delete('/api/empleados/:id', async (req, res) => {
    await Empleado.findByIdAndDelete(req.params.id);
    res.send('Empleado eliminado');
});

// CRUD Pedidos
app.get('/api/pedidos', async (req, res) => {
    const pedidos = await Pedido.find();
    res.json(pedidos);
});
app.post('/api/pedidos', async (req, res) => {
    const nuevo = new Pedido(req.body);
    await nuevo.save();
    res.status(201).send('Pedido creado');
});

app.delete('/api/pedidos/:id', async (req, res) => {
    await Pedido.findByIdAndDelete(req.params.id);
    res.send('Pedido eliminado');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);

});