const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PEDIDOS_FILE = __dirname + "/pedidos.json";
const PRODUCTOS_FILE = __dirname + "/productos.json";

if (!fs.existsSync(PEDIDOS_FILE)) fs.writeFileSync(PEDIDOS_FILE, "[]");
if (!fs.existsSync(PRODUCTOS_FILE)) fs.writeFileSync(PRODUCTOS_FILE, "[]");

// PRODUCTOS
app.get("/productos", (req, res) => {
  const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE));
  res.json(productos);
});

app.post("/producto", (req, res) => {
  const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE));
  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre,
    categoria: req.body.categoria,
    precioKg: req.body.precioKg,
    stock: req.body.stock,
    imagen: req.body.imagen,
    descripcion: req.body.descripcion
  };
  productos.push(nuevo);
  fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2));
  res.json({ ok: true, mensaje: "Producto creado", producto: nuevo });
});

app.put("/producto/:id", (req, res) => {
  const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE));
  const id = Number(req.params.id);
  const index = productos.findIndex(p => p.id === id);
  if (index === -1) return res.json({ ok: false, mensaje: "No encontrado" });

  productos[index] = { ...productos[index], ...req.body };
  fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2));
  res.json({ ok: true, mensaje: "Producto actualizado", producto: productos[index] });
});

app.delete("/producto/:id", (req, res) => {
  const productos = JSON.parse(fs.readFileSync(PRODUCTOS_FILE));
  const id = Number(req.params.id);
  const nuevos = productos.filter(p => p.id !== id);
  fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(nuevos, null, 2));
  res.json({ ok: true, mensaje: "Producto eliminado" });
});

// PEDIDOS (para el futuro)
app.post("/pedido", (req, res) => {
  const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
  pedidos.push({
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    ...req.body
  });
  fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
  res.json({ ok: true, mensaje: "Pedido guardado" });
});

app.get("/pedidos", (req, res) => {
  const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
  res.json(pedidos);
});

app.listen(3000, () => {
  console.log("Servidor activo en http://localhost:3000");
});
