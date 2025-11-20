// ============================
//  ESTADO GLOBAL
// ============================
const API_BASE = 'http://91.99.200.199:3000';

let carrito = JSON.parse(window.localStorage.getItem('carrito') || '[]');
let productosCache = null;       // para frontend (fruites/verdures/altres)
let adminProductos = [];         // para panel admin

document.addEventListener('DOMContentLoaded', function() {
  const mainContent = document.getElementById('main-content');

  // --- CONTENIDO ESTÁTICO BÁSICO ---
  const aboutContent = `
    <section class="about">
      <img src="./assets/cesta de fruta1.png" alt="Logo Cistell d'Or" class="cistell" />
      <h2>Qui som</h2>
      <p>Som una fruteria familiar dedicada a oferir productes frescos, locals i de temporada. Creiem en la qualitat natural i en l’abundància que la terra ens regala.</p>
    </section>

    <hr>

    <section>
      <a href="#" data-page="fruits">
        <img src="./assets/cestafrutas.png" alt="" class="productos">
      </a>
      <h2>Fruites</h2>
      <p>Gaudeix de la nostra selecció de fruites madures, dolces i plenes de color. Sempre fresques i de proximitat.</p>
      <button data-page="fruits" class="btn">Veure Fruites</button>
    </section>

    <hr>

    <section>
      <a href="#" data-page="vegetables">
        <img src="./assets/cestaverdura.png" alt="" class="productos">
      </a>
      <h2>Verdures</h2>
      <p>Verdures tendres, naturals i recollides amb cura per mantenir el seu sabor i valor nutritiu.</p>
      <button data-page="vegetables" class="btn">Veure Verdures</button>
    </section>

    <hr>

    <section>
      <a href="#" data-page="products">
        <img src="./assets/cestaproductovarios.png" alt="" class="productos">
      </a>
      <h2>Altres Productes</h2>
      <p>A més de fruites i verdures, oferim melmelades, fruits secs, sucs naturals i productes d’artesania local.</p>
      <button data-page="products" class="btn">Descobrir més</button>
    </section>
  `;

  const fruitsStatic = `
  <section>
    <h1>Manzanas</h1>
    <img src="./assets/frutas/cestamanzana.png" class="productos">
  </section>
  <hr>
  <section>
    <h1>Peras</h1>
    <img src="./assets/frutas/cestaperas.png" class="productos">
  </section>
  <hr>
  <section>
    <h1>Citricos</h1>
    <img src="./assets/frutas/cestacitricos.png" class="productos">
  </section>
  <hr>
  <section>
    <h1>Platano y Banana</h1>
    <img src="./assets/frutas/cestaplatano.png" alt=" class="productos">
  </section>
  <hr>
  <section>
    <h1>Uvas</h1>
    <img src="./assets/frutas/cestauva.png" class="productos">
  </section>
  <hr>
  <section>
    <h1>Kiwis</h1>
    <img src="./assets/frutas/cestakiwi.png" class="productos">
  </section>
`;


  const vegetablesStatic = `
    <section>
      <h1>Verdures</h1>
      <p>Pròximament les verdures...</p>
    </section>
  `;

  const productsStatic = `
    <section>
      <h1>Altres productes</h1>
      <p>Pròximament més productes...</p>
    </section>
  `;

  const contactContent = `
    <section>
      <h1>Contacte</h1>
      <form id="contactForm">
        <label>Nom:<br><input type="text" name="name" required></label><br>
        <label>Email:<br><input type="email" name="email" required></label><br>
        <label>Missatge:<br><textarea name="message" required></textarea></label><br>
        <button type="submit">Enviar</button>
      </form>
    </section>
  `;

  const adminContent = `
    <section class="admin">
      <h1>Administració de productes</h1>
      <p>Aquí pots crear, editar i eliminar productes. Aquesta secció és només per a tu.</p>

      <h2>Llista de productes</h2>
      <div id="admin-products"></div>

      <hr>

      <h2>Nou / Editar producte</h2>
      <form id="admin-product-form">
        <input type="hidden" id="product-id">

        <label>Nom del producte<br>
          <input type="text" id="product-nombre" required>
        </label><br>

        <label>Categoria (fruita, verdura, altres)<br>
          <input type="text" id="product-categoria" placeholder="fruita | verdura | altres">
        </label><br>

        <label>Subcategoria (p.ex. manzanas, citrics, platanos)<br>
          <input type="text" id="product-subcategoria" placeholder="manzanas, citrics, platanos...">
        </label><br>

        <label>Preu per kg (€)<br>
          <input type="number" step="0.01" id="product-precioKg" required>
        </label><br>

        <label>Stock (kg)<br>
          <input type="number" step="0.01" id="product-stock" required>
        </label><br>

        <label>Ruta imatge (opcional)<br>
          <input type="text" id="product-imagen" placeholder="./assets/...">
        </label><br>

        <label>Descripció<br>
          <textarea id="product-descripcion"></textarea>
        </label><br>

        <button type="submit" class="btn">Guardar producte</button>
        <button type="button" id="product-form-reset" class="btn">Nou producte</button>
      </form>
    </section>
  `;

  // Checkout: se genera con función porque depende del carrito
  function checkoutContent() {
    if (!carrito || carrito.length === 0) {
      return `
        <section>
          <h1>Cistell</h1>
          <p>El cistell està buit.</p>
        </section>
      `;
    }

    const llista = carrito.map(item => `
      <li>
        ${item.nombre} – ${item.kg.toFixed(2)} kg × ${item.precioKg.toFixed(2)} €/kg 
        = ${(item.kg * item.precioKg).toFixed(2)} €
      </li>
    `).join('');

    const total = carrito.reduce((acc, item) => acc + item.kg * item.precioKg, 0);

    return `
      <section>
        <h1>Cistell</h1>
        <ul>${llista}</ul>
        <p><strong>Total aproximat:</strong> ${total.toFixed(2)} €</p>

        <h2>Dades de contacte</h2>
        <form id="checkout-form">
          <label>Nom i cognoms<br>
            <input type="text" id="chk-nom" required>
          </label><br>

          <label>Telèfon<br>
            <input type="text" id="chk-tel" required>
          </label><br>

          <label>Forma de pagament<br>
            <select id="chk-pago">
              <option value="metalic">Metàl·lic</option>
              <option value="tarjeta">Targeta</option>
            </select>
          </label><br>

          <label>Comentaris / Observacions<br>
            <textarea id="chk-notes"></textarea>
          </label><br>

          <button type="submit" class="btn">Enviar comanda</button>
        </form>
      </section>
    `;
  }

  // ============================
  //  UTILIDADES
  // ============================
  function marcarPaginaActiva(page) {
    const navButtons = document.querySelectorAll('nav button[data-page]');
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-page') === page) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function guardarCarrito() {
    window.localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  async function fetchProductos() {
    if (productosCache) return productosCache;
    try {
      const res = await fetch(API_BASE + '/productos');
      const data = await res.json();
      if (Array.isArray(data)) {
        productosCache = data;
        return data;
      }
      productosCache = [];
      return [];
    } catch (err) {
      console.error(err);
      productosCache = [];
      return [];
    }
  }

  function categoriaToPage(categoria) {
    if (categoria === 'fruita') return 'fruits';
    if (categoria === 'verdura') return 'vegetables';
    return 'products';
  }

  // ============================
  //  RENDER: CATEGORÍA PRINCIPAL
  // ============================
  async function renderCategoriaPrincipal(categoria) {
    mainContent.innerHTML = `
      <section>
        <h1>${categoria === 'fruita' ? 'Fruites' : categoria === 'verdura' ? 'Verdures' : 'Altres productes'}</h1>
        <p>Carregant categories...</p>
      </section>
    `;

    const productos = await fetchProductos();
    const filtrats = productos.filter(p => p.categoria === categoria);

    if (!filtrats.length) {
      mainContent.innerHTML = `
        <section>
          <h1>${categoria === 'fruita' ? 'Fruites' : categoria === 'verdura' ? 'Verdures' : 'Altres productes'}</h1>
          <p>Encara no hi ha productes en aquesta categoria.</p>
        </section>
      `;
      return;
    }

    const subcatsSet = new Set();
    filtrats.forEach(p => {
      if (p.subcategoria) subcatsSet.add(p.subcategoria);
    });

    const subcats = Array.from(subcatsSet);

    const cards = subcats.map(sub => {
      const primer = filtrats.find(p => p.subcategoria === sub);
      return `
        <article class="subcat-card">
          ${primer && primer.imagen ? `<img src="${primer.imagen}" alt="${sub}" class="productos">` : ''}
          <h2>${sub}</h2>
          <button class="btn"
            data-page="subcat:${categoria}:${sub}">
            Veure ${sub}
          </button>
        </article>
      `;
    }).join('');

    mainContent.innerHTML = `
      <section>
        <h1>${categoria === 'fruita' ? 'Fruites' : categoria === 'verdura' ? 'Verdures' : 'Altres productes'}</h1>
        <div class="subcat-container">
          ${cards}
        </div>
      </section>
    `;
  }

  // ============================
  //  RENDER: SUBCATEGORÍA
  // ============================
  async function renderSubcategoria(categoria, subcat) {
    mainContent.innerHTML = `
      <section>
        <h1>${subcat}</h1>
        <p>Carregant productes...</p>
      </section>
    `;

    const productos = await fetchProductos();
    const filtrats = productos.filter(p => p.categoria === categoria && p.subcategoria === subcat);

    if (!filtrats.length) {
      mainContent.innerHTML = `
        <section>
          <h1>${subcat}</h1>
          <p>Encara no hi ha productes en aquesta secció.</p>
        </section>
      `;
      return;
    }

    const cards = filtrats.map(p => `
      <article class="product-card" data-product-id="${p.id}">
        ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="productos">` : ''}
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ''}</p>
        <p><strong>${Number(p.precioKg).toFixed(2)} €/kg</strong></p>
        <p>Stock: ${p.stock} kg</p>
        <label>Kg:
          <input type="number" step="0.1" min="0.1" value="1" data-role="qty">
        </label>
        <button class="btn" data-action="add-to-cart" data-id="${p.id}">Afegir al cistell</button>
      </article>
    `).join('');

    const botoCistell = `
      <div style="margin-top:20px;">
        <button class="btn" data-page="checkout">Veure cistell / Finalitzar comanda</button>
      </div>
    `;

    mainContent.innerHTML = `
      <section>
        <h1>${subcat}</h1>
        <div class="product-grid">
          ${cards}
        </div>
        ${botoCistell}
      </section>
    `;
  }

  // ============================
  //  CONTACTE
  // ============================
  function paginaContacte() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Gràcies per contactar amb nosaltres!');
      form.reset();
    });
  }

  // ============================
  //  ADMIN: PRODUCTES
  // ============================
  async function carregarProductesAdmin() {
    const container = document.getElementById('admin-products');
    if (!container) return;

    container.innerHTML = '<p>Carregant productes...</p>';

    try {
      const res = await fetch(API_BASE + '/productos');
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        adminProductos = [];
        container.innerHTML = '<p>Encara no hi ha productes.</p>';
        return;
      }

      adminProductos = data;
      productosCache = data; // mantenim coherència amb frontend

      const cardsHtml = data.map(p => `
        <article class="admin-product-card" data-product-id="${p.id}">
          ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="productos">` : ''}
          <h3>${p.nombre}</h3>
          <p>Categoria: ${p.categoria || '-'}</p>
          <p>Subcategoria: ${p.subcategoria || '-'}</p>
          <p>Preu/kg: ${Number(p.precioKg).toFixed(2)} €</p>
          <p>Stock: ${p.stock} kg</p>
          <button class="btn" data-admin-action="edit" data-id="${p.id}">Editar</button>
          <button class="btn" data-admin-action="delete" data-id="${p.id}">Eliminar</button>
        </article>
      `).join('');

      container.innerHTML = cardsHtml;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p>Error en carregar productes.</p>';
    }
  }

  function netejarFormulariProducte() {
    const idInput = document.getElementById('product-id');
    const nomInput = document.getElementById('product-nombre');
    const catInput = document.getElementById('product-categoria');
    const subcatInput = document.getElementById('product-subcategoria');
    const preuInput = document.getElementById('product-precioKg');
    const stockInput = document.getElementById('product-stock');
    const imgInput = document.getElementById('product-imagen');
    const descInput = document.getElementById('product-descripcion');

    if (!idInput) return;

    idInput.value = '';
    nomInput.value = '';
    catInput.value = '';
    subcatInput.value = '';
    preuInput.value = '';
    stockInput.value = '';
    imgInput.value = '';
    descInput.value = '';
  }

  function omplirFormulariPerEditar(id) {
    const producte = adminProductos.find(p => String(p.id) === String(id));
    if (!producte) {
      alert('Producte no trobat');
      return;
    }

    const idInput = document.getElementById('product-id');
    const nomInput = document.getElementById('product-nombre');
    const catInput = document.getElementById('product-categoria');
    const subcatInput = document.getElementById('product-subcategoria');
    const preuInput = document.getElementById('product-precioKg');
    const stockInput = document.getElementById('product-stock');
    const imgInput = document.getElementById('product-imagen');
    const descInput = document.getElementById('product-descripcion');

    if (!idInput) return;

    idInput.value = producte.id;
    nomInput.value = producte.nombre || '';
    catInput.value = producte.categoria || '';
    subcatInput.value = producte.subcategoria || '';
    preuInput.value = producte.precioKg || '';
    stockInput.value = producte.stock || '';
    imgInput.value = producte.imagen || '';
    descInput.value = producte.descripcion || '';
  }

  async function eliminarProducte(id) {
    const confirmar = window.confirm('Segur que vols eliminar aquest producte?');
    if (!confirmar) return;

    try {
      const res = await fetch(API_BASE + '/producto/' + id, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        alert('Producte eliminat');
        productosCache = null;
        carregarProductesAdmin();
      } else {
        alert('No s\'ha pogut eliminar el producte');
      }
    } catch (err) {
      console.error(err);
      alert('Error en eliminar el producte');
    }
  }

  async function desarProducte(e) {
    e.preventDefault();

    const idInput = document.getElementById('product-id');
    const nomInput = document.getElementById('product-nombre');
    const catInput = document.getElementById('product-categoria');
    const subcatInput = document.getElementById('product-subcategoria');
    const preuInput = document.getElementById('product-precioKg');
    const stockInput = document.getElementById('product-stock');
    const imgInput = document.getElementById('product-imagen');
    const descInput = document.getElementById('product-descripcion');

    if (!nomInput || !preuInput || !stockInput) return;

    const payload = {
      nombre: nomInput.value,
      categoria: catInput.value,
      subcategoria: subcatInput.value,
      precioKg: Number(preuInput.value),
      stock: Number(stockInput.value),
      imagen: imgInput.value,
      descripcion: descInput.value
    };

    const id = idInput.value;

    try {
      let res;
      if (id) {
        res = await fetch(API_BASE + '/producto/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(API_BASE + '/producto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.ok) {
        alert('Producte desat correctament');
        productosCache = null;
        netejarFormulariProducte();
        carregarProductesAdmin();
      } else {
        alert('No s\'ha pogut desar el producte');
      }
    } catch (err) {
      console.error(err);
      alert('Error en desar el producte');
    }
  }

  function initAdmin() {
    carregarProductesAdmin();

    const form = document.getElementById('admin-product-form');
    const resetBtn = document.getElementById('product-form-reset');

    if (form) {
      form.addEventListener('submit', desarProducte);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        netejarFormulariProducte();
      });
    }
  }

  function manejarAccioAdmin(target) {
    const action = target.getAttribute('data-admin-action');
    const id = target.getAttribute('data-id');
    if (!action || !id) return;

    if (action === 'edit') {
      omplirFormulariPerEditar(id);
    } else if (action === 'delete') {
      eliminarProducte(id);
    }
  }

  // ============================
  //  CARRITO
  // ============================
  function agregarAlCarritoDesdeDom(btn) {
    const id = Number(btn.getAttribute('data-id'));
    if (!id) return;

    const card = btn.closest('.product-card');
    if (!card) return;

    const qtyInput = card.querySelector('input[data-role="qty"]');
    const kg = parseFloat(qtyInput && qtyInput.value ? qtyInput.value : '0');

    if (!kg || kg <= 0) {
      alert('Introdueix una quantitat en kg vàlida');
      return;
    }

    if (!productosCache) {
      alert('Error: productes no carregats');
      return;
    }

    const prod = productosCache.find(p => Number(p.id) === id);
    if (!prod) {
      alert('Producte no trobat');
      return;
    }

    // Buscar si ja existeix al cistell
    const existent = carrito.find(item => item.id === id);
    if (existent) {
      existent.kg += kg;
    } else {
      carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precioKg: prod.precioKg,
        kg: kg
      });
    }

    guardarCarrito();
    alert('Afegit al cistell');
  }

  function initCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!carrito || carrito.length === 0) {
        alert('El cistell està buit');
        return;
      }

      const nom = document.getElementById('chk-nom').value.trim();
      const tel = document.getElementById('chk-tel').value.trim();
      const pago = document.getElementById('chk-pago').value;
      const notes = document.getElementById('chk-notes').value.trim();

      const pedido = {
        nombre: nom,
        telefono: tel,
        pago: pago,
        notes: notes,
        carrito: carrito
      };

      try {
        const res = await fetch(API_BASE + '/pedido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedido)
        });
        const data = await res.json();
        if (data.ok) {
          alert('Comanda enviada correctament!');
          carrito = [];
          guardarCarrito();
          loadPage('about');
        } else {
          alert('No s\'ha pogut enviar la comanda');
        }
      } catch (err) {
        console.error(err);
        alert('Error en enviar la comanda');
      }
    });
  }

  // ============================
  //  ADMIN: DESBLOQUEO / LOGOUT
  // ============================
  function mostrarAdmin() {
    const adminBtn = document.getElementById('admin-btn');
    const logoutBtn = document.getElementById('admin-logout');
    if (adminBtn) adminBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  }

  function ocultarAdmin() {
    const adminBtn = document.getElementById('admin-btn');
    const logoutBtn = document.getElementById('admin-logout');
    if (adminBtn) adminBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  if (localStorage.getItem("adminUnlocked") === "true") {
    mostrarAdmin();
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
      const clave = prompt("Introdueix la clau secreta:");
      if (clave === "cistell123") { // ← CAMBIA AQUÍ TU CLAVE
        alert("Mode administrador activat");
        localStorage.setItem("adminUnlocked", "true");
        mostrarAdmin();
      } else {
        alert("Clau incorrecta");
      }
    }
  });

  // ============================
  //  NAVEGACIÓN SPA
  // ============================
  function loadPage(page) {
    // Subpàgines de subcategoria: "subcat:fruita:manzanas"
    if (page && page.startsWith('subcat:')) {
      const parts = page.split(':');
      const categoria = parts[1];
      const subcat = parts.slice(2).join(':');

      marcarPaginaActiva(categoriaToPage(categoria));
      renderSubcategoria(categoria, subcat);
      return;
    }

    let content = '';

    switch(page) {
      case 'about':
        content = aboutContent;
        break;
      case 'fruits':
        content = `<section><h1>Fruites</h1><p>Carregant...</p></section>`;
        break;
      case 'vegetables':
        content = `<section><h1>Verdures</h1><p>Carregant...</p></section>`;
        break;
      case 'products':
        content = `<section><h1>Altres productes</h1><p>Carregant...</p></section>`;
        break;
      case 'contact':
        content = contactContent;
        break;
      case 'admin':
        content = adminContent;
        break;
      case 'checkout':
        content = checkoutContent();
        break;
      default:
        content = aboutContent;
    }

    mainContent.innerHTML = content;
    marcarPaginaActiva(page);

    if (page === 'contact') paginaContacte();
    if (page === 'admin') initAdmin();
    if (page === 'fruits') renderCategoriaPrincipal('fruita');
    if (page === 'vegetables') renderCategoriaPrincipal('verdura');
    if (page === 'products') renderCategoriaPrincipal('altres');
    if (page === 'checkout') initCheckout();
  }

  // Delegación de clics global:
  document.addEventListener('click', (e) => {
    // Navegación por data-page
    const pageTarget = e.target.closest('[data-page]');
    if (pageTarget) {
      e.preventDefault();
      const page = pageTarget.getAttribute('data-page');
      loadPage(page);
      return;
    }

    // Acciones Admin
    const adminTarget = e.target.closest('[data-admin-action]');
    if (adminTarget) {
      e.preventDefault();
      manejarAccioAdmin(adminTarget);
      return;
    }

    // Logout admin
    if (e.target.id === 'btn-logout-admin') {
      e.preventDefault();
      const confirmar = confirm("Segur que vols tancar la sessió d'administrador?");
      if (!confirmar) return;
      localStorage.removeItem("adminUnlocked");
      ocultarAdmin();
      alert("Has tancat la sessió d'administrador.");
      return;
    }

    // Afegir al cistell
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      e.preventDefault();
      agregarAlCarritoDesdeDom(addBtn);
      return;
    }
  });

  // Carga inicial
  loadPage('about');
});
