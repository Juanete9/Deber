const form = document.getElementById('form-recetas');
const inputBusqueda = document.getElementById('busqueda');
const resultadosDiv = document.getElementById('resultados');
const loading = document.getElementById('loading');
const mensaje = document.getElementById('mensaje');
const toggleBtn = document.getElementById('toggle-theme');
const btnVerTodas = document.getElementById('ver-todas');

const formAgregar = document.getElementById('form-agregar');
const inputNombre = document.getElementById('nombre');
const inputIngredientes = document.getElementById('ingredientes');
const inputImagen = document.getElementById('imagen');
const inputUrl = document.getElementById('url');

let recetasGlobal = []; // guardamos recetas en memoria

// Guardar recetas en localStorage
function guardarRecetasLocal() {
  localStorage.setItem('recetasGuardadas', JSON.stringify(recetasGlobal));
}

// Obtener recetas guardadas en localStorage
function obtenerRecetasLocal() {
  const recetas = localStorage.getItem('recetasGuardadas');
  return recetas ? JSON.parse(recetas) : [];
}

// Cargar recetas desde JSON + localStorage
async function cargarRecetas() {
  loading.classList.remove('hidden');
  mensaje.textContent = '';

  try {
    const res = await fetch('./data/recetas.json');
    const data = await res.json();

    const recetasGuardadas = obtenerRecetasLocal();
    recetasGlobal = [...data, ...recetasGuardadas];

    loading.classList.add('hidden');
  } catch (error) {
    loading.classList.add('hidden');
    mensaje.textContent = `⚠️ Error al cargar recetas: ${error.message}`;
  }
}

cargarRecetas();

// Buscar receta
form.addEventListener('submit', e => {
  e.preventDefault();
  const query = inputBusqueda.value.trim().toLowerCase();
  if (query) {
    buscarRecetas(query);
  }
});

function buscarRecetas(query) {
  resultadosDiv.innerHTML = '';
  mensaje.textContent = '';
  loading.classList.remove('hidden');

  // Filtrar recetas en memoria
  const filtradas = recetasGlobal.filter(receta =>
    receta.nombre.toLowerCase().includes(query) ||
    receta.ingredientes.some(ing => ing.toLowerCase().includes(query))
  );

  loading.classList.add('hidden');

  if (filtradas.length === 0) {
    mensaje.textContent = '😞 No se encontraron recetas con ese término.';
    return;
  }

  mostrarRecetas(filtradas);
}

// Mostrar todas las recetas
btnVerTodas.addEventListener('click', () => {
  mensaje.textContent = '';
  mostrarRecetas(recetasGlobal);
});

// Mostrar recetas en pantalla
function mostrarRecetas(recetas) {
  resultadosDiv.innerHTML = '';
  recetas.forEach(receta => {
    const div = document.createElement('div');
    div.classList.add('receta');

    div.innerHTML = `
      <h3>${receta.nombre}</h3>
      ${
        receta.imagen
          ? `<img src="${receta.imagen}" alt="Imagen de ${receta.nombre}" />`
          : `<div class="sin-imagen">Sin imagen disponible</div>`
      }
      <p><strong>Ingredientes:</strong> ${receta.ingredientes.join(', ')}</p>
      ${
        receta.url
          ? `<a href="${receta.url}" target="_blank" rel="noopener noreferrer">Ver receta completa</a>`
          : `<p><em>Receta sin enlace</em></p>`
      }
    `;

    resultadosDiv.appendChild(div);
  });
}

// Toggle modo oscuro
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Añadir nueva receta
formAgregar.addEventListener('submit', e => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const ingredientes = inputIngredientes.value.split(',').map(i => i.trim()).filter(Boolean);
  const imagen = inputImagen.value.trim();
  const url = inputUrl.value.trim();

  if (!nombre || ingredientes.length === 0) {
    alert('Por favor, completa el nombre y los ingredientes.');
    return;
  }

  const nuevaReceta = { nombre, ingredientes };

  if (imagen) nuevaReceta.imagen = imagen;
  if (url) nuevaReceta.url = url;

  recetasGlobal.push(nuevaReceta);
  guardarRecetasLocal();
  mostrarRecetas([nuevaReceta]);

  formAgregar.reset();
  mensaje.textContent = '✅ Receta añadida correctamente.';
});
