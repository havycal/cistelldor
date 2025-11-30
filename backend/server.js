const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas a ficheros JSON
const productosPath = path.join(__dirname, 'productos.json');
const pedidosPath   = path.join(__dirname, 'pedidos.json');

// ============================
//  PRODUCTOS (CRUD)
// ============================

// Obtener todos los productos
app.get('/productos', (req, res) => {
  try {
    if (!fs.existsSync(productosPath)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error leyendo productos' });
  }
});

// Crear producto
app.post('/producto', (req, res) => {
  try {
    const body = req.body;

    if (!body.nombre || !body.precioKg) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    const productos = fs.existsSync(productosPath)
      ? JSON.parse(fs.readFileSync(productosPath, 'utf8'))
      : [];

    const nuevo = {
      id: Date.now(),
      nombre: body.nombre,
      categoria: body.categoria || '',
      subcategoria: body.subcategoria || '',
      precioKg: Number(body.precioKg) || 0,
      stock: Number(body.stock) || 0,
      imagen: body.imagen || '',
      descripcion: body.descripcion || ''
    };

    productos.push(nuevo);
    fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));

    res.json({ ok: true, producto: nuevo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error creando producto' });
  }
});

// Actualizar producto
app.put('/producto/:id', (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    if (!fs.existsSync(productosPath)) {
      return res.status(404).json({ ok: false, error: 'No hay productos' });
    }

    const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
    const index = productos.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    productos[index] = {
      ...productos[index],
      nombre: body.nombre ?? productos[index].nombre,
      categoria: body.categoria ?? productos[index].categoria,
      subcategoria: body.subcategoria ?? productos[index].subcategoria,
      precioKg: body.precioKg != null ? Number(body.precioKg) : productos[index].precioKg,
      stock: body.stock != null ? Number(body.stock) : productos[index].stock,
      imagen: body.imagen ?? productos[index].imagen,
      descripcion: body.descripcion ?? productos[index].descripcion
    };

    fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));
    res.json({ ok: true, producto: productos[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error actualizando producto' });
  }
});

// Eliminar producto
app.delete('/producto/:id', (req, res) => {
  try {
    const id = req.params.id;

    if (!fs.existsSync(productosPath)) {
      return res.status(404).json({ ok: false, error: 'No hay productos' });
    }

    const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
    const nuevos = productos.filter(p => String(p.id) !== String(id));

    if (nuevos.length === productos.length) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    fs.writeFileSync(productosPath, JSON.stringify(nuevos, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error eliminando producto' });
  }
});

// ============================
//  PEDIDOS
// ============================

// Crear pedido
app.post('/pedido', (req, res) => {
  try {
    const pedido = req.body;
    if (!pedido || !pedido.carrito || !Array.isArray(pedido.carrito)) {
      return res.status(400).json({ ok: false, error: 'Pedido inválido' });
    }

    const pedidos = fs.existsSync(pedidosPath)
      ? JSON.parse(fs.readFileSync(pedidosPath, 'utf8'))
      : [];

    const nuevo = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      ...pedido
    };

    pedidos.push(nuevo);
    fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2));

    res.json({ ok: true, pedido: nuevo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error guardando pedido' });
  }
});

// Listar pedidos (para admin)
app.get('/pedidos', (req, res) => {
  try {
    if (!fs.existsSync(pedidosPath)) {
      return res.json([]);
    }
    const pedidos = JSON.parse(fs.readFileSync(pedidosPath, 'utf8'));
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error leyendo pedidos' });
  }
});

// ============================
//  ARRANQUE
// ============================
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://0.0.0.0:${PORT}`);
});
