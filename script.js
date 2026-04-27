// script.js - Versión completa con subida de archivos corregida
const SUPABASE_URL = "https://qrpriaubgklmzfklxvru.supabase.co";
const SUPABASE_KEY = "sb_publishable_lephArQ641cJaf0lnBjVKg_YSQ4uD9I";
let esAdmin = false;
let modalElement;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("✅ Supabase conectado");

// ========== FUNCIONES DE ASIGNACIÓN AUTOMÁTICA ==========

function obtenerUnidadPorNumeroSemana(numeroSemana) {
    if (numeroSemana >= 1 && numeroSemana <= 4) return 'u1';
    if (numeroSemana >= 5 && numeroSemana <= 8) return 'u2';
    if (numeroSemana >= 9 && numeroSemana <= 12) return 'u3';
    if (numeroSemana >= 13 && numeroSemana <= 16) return 'u4';
    return null;
}

function obtenerNombreUnidad(unidadId) {
    const nombres = {
        'u1': '📘 Unidad 1 - Introducción a la arquitectura de base de datos',
        'u2': '📘 Unidad 2 - Modelado de datos',
        'u3': '📘 Unidad 3 - Lenguaje SQL',
        'u4': '📘 Unidad 4 - Optimización y administración'
    };
    return nombres[unidadId] || unidadId;
}

function obtenerColorUnidad(numeroSemana) {
    if (numeroSemana >= 1 && numeroSemana <= 4) return { bg: '#e8f5e9', border: '#81c784', text: '#2e7d32' };
    if (numeroSemana >= 5 && numeroSemana <= 8) return { bg: '#f3e5f5', border: '#ce93d8', text: '#6a1b9a' };
    if (numeroSemana >= 9 && numeroSemana <= 12) return { bg: '#fce4ec', border: '#f48fb1', text: '#c2185b' };
    if (numeroSemana >= 13 && numeroSemana <= 16) return { bg: '#e1f5fe', border: '#4fc3f7', text: '#0277bd' };
    return { bg: '#fff', border: '#e8e0d5', text: '#666' };
}

// ========== NAVEGACIÓN ==========
function cambiarSeccion(seccionId) {
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
  document.getElementById(seccionId).classList.add('activa');
  
  document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('active'));
  if (seccionId === 'sobre-mi') document.getElementById('nav-sobre-mi').classList.add('active');
  if (seccionId === 'info-academica') document.getElementById('nav-info').classList.add('active');
  if (seccionId === 'tareas') document.getElementById('nav-tareas').classList.add('active');
}

function entrarSistema() {
  const pantalla = document.getElementById("pantalla-bienvenida");
  pantalla.style.opacity = "0";
  pantalla.style.transition = "opacity 0.8s ease";
  setTimeout(() => pantalla.style.display = "none", 800);
}

// ========== CARGAR DATOS ==========
async function cargarDatos() {
  console.log("🔄 Cargando datos...");
  
  const { data: unidadesData, error: errorU } = await supabaseClient.from("unidades").select("*");
  const { data: semanasData, error: errorS } = await supabaseClient.from("semanas").select("*");
  const { data: archivosData, error: errorA } = await supabaseClient.from("archivos").select("*");

  if (errorU || errorS || errorA) {
    console.error("❌ Error en Supabase:", errorU || errorS || errorA);
    return;
  }

  if (unidadesData && unidadesData.length > 0) {
    // ORDENAR unidades: u1, u2, u3, u4
    const ordenUnidades = ['u1', 'u2', 'u3', 'u4'];
    const unidadesOrdenadas = unidadesData.sort((a, b) => {
      return ordenUnidades.indexOf(a.id) - ordenUnidades.indexOf(b.id);
    });
    
    const unidades = unidadesOrdenadas.map(u => ({
      ...u,
      semanas: semanasData ? semanasData
        .filter(s => s.unidad_id === u.id)
        // ORDENAR semanas: semana1, semana2, ..., semana16
        .sort((a, b) => {
          const numA = parseInt(a.id.replace('semana', ''));
          const numB = parseInt(b.id.replace('semana', ''));
          return numA - numB;
        })
        .map(s => ({
          ...s,
          archivos: archivosData ? archivosData.filter(a => a.semana_id === s.id) : []
        })) : []
    }));
    renderUnidades(unidades);
  } else {
    console.warn("⚠️ No hay unidades creadas");
    document.getElementById("contenedor-semanas").innerHTML = '<p style="text-align:center">No hay unidades disponibles. Inicia sesión como admin para crear contenido.</p>';
  }
}

function renderUnidades(unidades) {
  const contenedor = document.getElementById("contenedor-semanas");
  contenedor.innerHTML = "";
  
  unidades.forEach(unidad => {
    const divUnidad = document.createElement("div");
    divUnidad.style.marginBottom = "30px";
    divUnidad.style.width = "100%";
    
    // Título de unidad con botones de admin
const tituloDiv = document.createElement('div');
tituloDiv.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; flex-wrap:wrap; gap:10px;';

const tituloH3 = document.createElement('h3');
tituloH3.style.cssText = 'margin:0;';
tituloH3.textContent = `📘 ${unidad.nombre}`;
tituloDiv.appendChild(tituloH3);

// Si es admin, agregar botones de editar/eliminar unidad
if (esAdmin) {
  const accionesDiv = document.createElement('div');
  accionesDiv.style.cssText = 'display:flex; gap:8px;';
  
  // Botón Editar Unidad
  const btnEditarUnidad = document.createElement('button');
  btnEditarUnidad.textContent = '✏️ Editar';
  btnEditarUnidad.style.cssText = 'background:#9b8bae; color:white; border:none; border-radius:8px; padding:6px 14px; cursor:pointer; font-weight:600; font-size:0.85rem; transition:all 0.3s ease;';
  btnEditarUnidad.onmouseover = () => { btnEditarUnidad.style.background = '#8a7b9e'; btnEditarUnidad.style.transform = 'scale(1.05)'; };
  btnEditarUnidad.onmouseout = () => { btnEditarUnidad.style.background = '#9b8bae'; btnEditarUnidad.style.transform = 'scale(1)'; };
  btnEditarUnidad.onclick = (e) => {
    e.stopPropagation();
    editarUnidad(unidad.id, unidad.nombre);
  };
  
  // Botón Eliminar Unidad
  const btnEliminarUnidad = document.createElement('button');
  btnEliminarUnidad.textContent = '🗑️ Eliminar';
  btnEliminarUnidad.style.cssText = 'background:#ffb3ba; color:#4a3b52; border:none; border-radius:8px; padding:6px 14px; cursor:pointer; font-weight:600; font-size:0.85rem; transition:all 0.3s ease;';
  btnEliminarUnidad.onmouseover = () => { btnEliminarUnidad.style.background = '#ff9aa2'; btnEliminarUnidad.style.transform = 'scale(1.05)'; };
  btnEliminarUnidad.onmouseout = () => { btnEliminarUnidad.style.background = '#ffb3ba'; btnEliminarUnidad.style.transform = 'scale(1)'; };
  btnEliminarUnidad.onclick = (e) => {
    e.stopPropagation();
    eliminarUnidad(unidad.id);
  };
  
  accionesDiv.appendChild(btnEditarUnidad);
  accionesDiv.appendChild(btnEliminarUnidad);
  tituloDiv.appendChild(accionesDiv);
}

divUnidad.appendChild(tituloDiv);
    
    const grid = document.createElement("div");
    grid.className = "grid-semanas";
    
    if (unidad.semanas.length === 0) {
      const p = document.createElement("p");
      p.style.color = "#666";
      p.style.fontStyle = "italic";
      p.textContent = "No hay semanas en esta unidad";
      grid.appendChild(p);
    }
    
    unidad.semanas.forEach(semana => {
      const card = document.createElement("div");
      card.className = "tarjeta-semana";
      card.innerHTML = `
        <span class="icon-semana">📅</span>
        <div class="tarjeta-semana-title">${semana.label}</div>
        <div class="tarjeta-semana-desc">${semana.descripcion || ''}</div>
        ${esAdmin ? `<div style="margin-top:10px;">
          <button class="edit-btn" data-id="${semana.id}" style="background:#9b8bae; color:white; border:none; border-radius:5px; padding:5px 10px; margin:0 5px; cursor:pointer;">✏️ Editar</button>
          <button class="delete-btn" data-id="${semana.id}" style="background:#ffb3ba; color:#4a3b52; border:none; border-radius:5px; padding:5px 10px; margin:0 5px; cursor:pointer;">🗑️ Eliminar</button>
        </div>` : ''}
      `;
      
      card.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') abrirModalPorSemana(semana);
      };
      
      if (esAdmin) {
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); editarSemana(semana.id); };
        if (deleteBtn) deleteBtn.onclick = (e) => { e.stopPropagation(); eliminarSemana(semana.id); };
      }
      
      grid.appendChild(card);
    });
    
    divUnidad.appendChild(grid);
    contenedor.appendChild(divUnidad);
  });
}

// ========== MODAL PARA VER ARCHIVOS ==========
async function abrirModalPorSemana(semana) {
  modalElement = document.getElementById("modal-tarea");
  const tieneArchivos = semana.archivos && semana.archivos.length > 0;
  const primerArchivo = tieneArchivos ? semana.archivos[0] : null;

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  
  modalContent.innerHTML = `
    <div class="modal-top">
      <div>
        <div class="modal-tarea-title">${semana.label}</div>
        <div style="font-size:0.9rem; color:#555;">${semana.descripcion || ''}</div>
      </div>
      <button class="volver-btn">⟵ Volver</button>
    </div>
    <div class="modal-body">
      <div class="modal-files">
        <h3>📄 Archivos</h3>
        <div id="lista-archivos-modal">
          ${tieneArchivos ? semana.archivos.map((a, i) => `<button class="file-item" data-index="${i}">📎 ${a.nombre}</button>`).join('') : '<div style="padding:1rem; text-align:center;">No hay archivos disponibles</div>'}
        </div>
      </div>
      <div class="modal-viewer">
        <div class="viewer-area" id="viewer-area"></div>
        <div class="viewer-bottom">
          <a class="abrir-pdf-btn" href="${primerArchivo?.enlace || '#'}" target="_blank">🔗 Abrir en nueva pestaña</a>
          <a class="abrir-github-btn" href="https://github.com/fmarcelocab03/bdII-portafolio/tree/main/archivos" target="_blank">🐙 Repositorio GitHub</a>
        </div>
      </div>
    </div>
  `;

  const viewerArea = modalContent.querySelector("#viewer-area");
  if (primerArchivo) {
    viewerArea.appendChild(crearViewerElemento(primerArchivo));
  } else {
    viewerArea.innerHTML = '<div style="padding:1rem; text-align:center;">📂 Selecciona un archivo de la lista</div>';
  }

  modalElement.innerHTML = "";
  modalElement.appendChild(modalContent);
  modalElement.classList.add("mostrar");

  modalContent.querySelector(".volver-btn").onclick = () => modalElement.classList.remove("mostrar");
  
  const fileItems = modalContent.querySelectorAll(".file-item");
  fileItems.forEach((btn, idx) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      fileItems.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      viewerArea.innerHTML = "";
      viewerArea.appendChild(crearViewerElemento(semana.archivos[idx]));
      const link = modalContent.querySelector(".abrir-pdf-btn");
      if (link) link.href = semana.archivos[idx]?.enlace || "#";
    };
    if (idx === 0) btn.classList.add("activo");
  });
}

function crearViewerElemento(archivo) {
  const wrapper = document.createElement("div");
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  
  if (!archivo?.enlace) {
    wrapper.innerHTML = '<div>Archivo no disponible</div>';
    return wrapper;
  }
  
  const enlace = archivo.enlace.toLowerCase();
  if (enlace.includes('.pdf')) {
    const embed = document.createElement("embed");
    embed.src = archivo.enlace;
    embed.type = "application/pdf";
    embed.style.width = "100%";
    embed.style.height = "100%";
    wrapper.appendChild(embed);
  } else if (enlace.match(/\.(png|jpe?g|gif|webp|svg)/)) {
    const img = document.createElement("img");
    img.src = archivo.enlace;
    img.alt = archivo.nombre || "Archivo";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    wrapper.appendChild(img);
  } else {
    const link = document.createElement("a");
    link.href = archivo.enlace;
    link.target = "_blank";
    link.style.background = "#9b8bae";
    link.style.color = "white";
    link.style.padding = "10px 20px";
    link.style.borderRadius = "8px";
    link.style.textDecoration = "none";
    link.textContent = "📥 Descargar / Ver archivo";
    wrapper.appendChild(link);
  }
  return wrapper;
}

// ========== FUNCIONES CRUD ==========
window.editarSemana = async function(id) {
  const nuevoNombre = prompt("Nuevo nombre de la semana:");
  const nuevaDesc = prompt("Nueva descripción:");
  if (!nuevoNombre && !nuevaDesc) return;
  const updates = {};
  if (nuevoNombre) updates.label = nuevoNombre;
  if (nuevaDesc) updates.descripcion = nuevaDesc;
  const { error } = await supabaseClient.from("semanas").update(updates).eq("id", id);
  if (error) alert("Error: " + error.message);
  else { alert("✅ Semana actualizada"); cargarDatos(); }
};

window.eliminarSemana = async function(id) {
  if (!confirm("¿Eliminar esta semana?")) return;
  await supabaseClient.from("archivos").delete().eq("semana_id", id);
  const { error } = await supabaseClient.from("semanas").delete().eq("id", id);
  if (error) alert("Error: " + error.message);
  else { alert("✅ Semana eliminada"); cargarDatos(); }
};

// ========== ADMIN - VENTANA ==========
function abrirAdminWindow() {
  document.getElementById("adminModalWindow").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarAdminWindow() {
  document.getElementById("adminModalWindow").style.display = "none";
  document.body.style.overflow = "auto";
}

window.cerrarModalAdmin = function() {
  document.getElementById("admin-login-modal").style.display = "none";
};

// INICIAR SESIÓN - Solo aquí se muestra el botón "Salir" y se activa edición
window.iniciarSesion = function() {
  const user = document.getElementById("admin-user").value;
  const pass = document.getElementById("admin-pass").value;
  
  if (user === "admin" && pass === "1234") {
    esAdmin = true;
    localStorage.setItem("admin", "true");
    
    // Mostrar botón de SALIR solo después de iniciar sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    
    // Ocultar modal de login
    window.cerrarModalAdmin();
    
    // Limpiar campos
    document.getElementById("admin-user").value = "";
    document.getElementById("admin-pass").value = "";
    
    // Abrir ventana de administración
    abrirAdminWindow();
    
    // Recargar datos para mostrar botones de editar/eliminar
    cargarDatos();
    
    alert("✅ ¡Bienvenido Admin!");
  } else {
    alert("❌ Credenciales incorrectas\n\nUsuario: admin\nContraseña: 1234");
  }
};

// CERRAR SESIÓN - Oculta botón "Salir" y desactiva edición
window.cerrarSesion = function() {
  esAdmin = false;
  localStorage.removeItem("admin");
  
  // Ocultar botón de SALIR
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.style.display = "none";
  
  // Cerrar ventana admin si está abierta
  cerrarAdminWindow();
  
  // Recargar datos sin botones de editar/eliminar
  cargarDatos();
  
  alert("👋 Sesión cerrada");
};

// TOGGLE ADMIN - Abre login o ventana admin según estado
window.toggleAdminLogin = function() {
  if (esAdmin) {
    // Si ya está logueado, abre la ventana de administración
    abrirAdminWindow();
  } else {
    // Si no está logueado, muestra el modal de login
    document.getElementById("admin-login-modal").style.display = "flex";
  }
};

// ========== CREAR UNIDAD ==========
window.crearUnidadWindow = async function() {
  const id = document.getElementById("unidad_id").value;
  const nombre = document.getElementById("unidad_nombre").value;
  if (!id || !nombre) return alert("Completa todos los campos");
  
  if (!['u1', 'u2', 'u3', 'u4'].includes(id)) {
    return alert("⚠️ El ID de unidad debe ser u1, u2, u3 o u4");
  }
  
  const { error } = await supabaseClient.from("unidades").insert([{ id, nombre }]);
  if (error) alert("Error: " + error.message);
  else { alert("✅ Unidad creada"); cargarDatos(); }
  document.getElementById("unidad_id").value = "";
  document.getElementById("unidad_nombre").value = "";
};

// ========== CREAR SEMANA ==========
window.crearSemanaWindow = async function() {
  const id = document.getElementById("semana_id").value;
  const label = document.getElementById("label").value;
  const descripcion = document.getElementById("descripcion").value;
  
  if (!id || !label) return alert("Completa ID y Nombre de la semana");
  
  const match = id.match(/^semana(\d+)$/i);
  if (!match) {
    return alert("⚠️ El ID debe tener el formato: semana1, semana2, ..., semana16");
  }
  
  const numeroSemana = parseInt(match[1]);
  if (numeroSemana < 1 || numeroSemana > 16) {
    return alert("⚠️ El número de semana debe estar entre 1 y 16");
  }
  
  const unidad_id = obtenerUnidadPorNumeroSemana(numeroSemana);
  
  if (!unidad_id) {
    return alert("⚠️ No se pudo determinar la unidad para esta semana");
  }
  
  const { data: unidadExiste } = await supabaseClient
    .from("unidades")
    .select("id, nombre")
    .eq("id", unidad_id)
    .single();
  
  if (!unidadExiste) {
    return alert(`⚠️ Primero debes crear la unidad ${unidad_id} en la sección "Crear Unidad"`);
  }
  
  const { error } = await supabaseClient.from("semanas").insert([{ 
    id, 
    label, 
    descripcion: descripcion || `Semana ${numeroSemana}`,
    unidad_id 
  }]);
  
  if (error) {
    if (error.code === '23505') {
      alert("❌ Ya existe una semana con este ID");
    } else {
      alert("Error: " + error.message);
    }
  } else { 
    alert(`✅ Semana creada exitosamente!\n📅 ${label}\n📚 ${unidadExiste.nombre}`);
    cargarDatos(); 
  }
  
  document.getElementById("semana_id").value = "";
  document.getElementById("label").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("unidad-preview").style.display = "none";
};

// ========== SUBIR ARCHIVO ==========
// ========== SUBIR ARCHIVO - VERSIÓN CORREGIDA ==========
window.subirArchivoWindow = async function() {
  console.log("=== INICIANDO SUBIDA DE ARCHIVO ===");
  
  const fileInput = document.getElementById("file_input_window");
  const semana_id = document.getElementById("semana_archivo").value;
  const nombre = document.getElementById("nombre_archivo").value;
  const file = fileInput.files[0];
  
  if (!file) {
    alert("📂 Por favor, selecciona un archivo primero");
    return;
  }
  
  if (!semana_id) {
    alert("📅 Ingresa el ID de la semana (ej: semana1, semana2, ..., semana16)");
    return;
  }
  
  if (!nombre) {
    alert("🏷️ Ingresa un nombre para el archivo");
    return;
  }
  
  const match = semana_id.match(/^semana(\d+)$/i);
  if (!match) {
    alert("⚠️ El ID de semana debe tener formato: semana1, semana2, ..., semana16");
    return;
  }
  
  const numeroSemana = parseInt(match[1]);
  if (numeroSemana < 1 || numeroSemana > 16) {
    alert("⚠️ El número de semana debe estar entre 1 y 16");
    return;
  }
  
  // Verificar que la semana exista
  const { data: semanaExiste, error: semanaError } = await supabaseClient
    .from("semanas")
    .select("id, label, unidad_id")
    .eq("id", semana_id)
    .single();
  
  if (semanaError || !semanaExiste) {
    alert(`⚠️ La semana "${semana_id}" no existe.\n\nPrimero créala en la sección "Crear Semana"`);
    return;
  }
  
  // Intentar verificar el bucket (con manejo de error)
  let bucketExiste = false;
  try {
    const { error: bucketTest } = await supabaseClient.storage
      .from("archivos")
      .list("", { limit: 1 });
    
    if (bucketTest) {
      console.error("Error de bucket:", bucketTest);
      alert("❌ ERROR: El bucket 'archivos' no existe en Supabase.\n\nSOLUCIÓN:\n1. Ve a Storage en Supabase\n2. Crea un bucket llamado 'archivos'\n3. Marca la opción 'Public bucket'\n4. Recarga la página");
      return;
    }
    bucketExiste = true;
  } catch (err) {
    console.error("Error al verificar bucket:", err);
    alert("❌ ERROR: No se puede conectar al bucket 'archivos'.\n\nVerifica que el bucket exista en Supabase Storage.");
    return;
  }
  
  if (!bucketExiste) return;
  
  // Preparar nombre del archivo
  const extension = file.name.split('.').pop();
  const nombreLimpio = nombre
    .replace(/\s/g, '_')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
  const fileName = `${Date.now()}_${semana_id}_${nombreLimpio}.${extension}`;
  
  console.log("Subiendo archivo:", fileName);
  console.log("Tamaño:", file.size, "bytes");
  
  try {
    // Subir a storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("archivos")
      .upload(fileName, file, { 
        cacheControl: '3600', 
        upsert: true 
      });
    
    if (uploadError) {
      console.error("Error en upload:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload exitoso:", uploadData);
    
    // Obtener URL pública
    const { data: urlData } = supabaseClient.storage
      .from("archivos")
      .getPublicUrl(fileName);
    
    const enlace = urlData.publicUrl;
    console.log("URL pública:", enlace);
    
    // Guardar en BD con ID único
const idUnico = Date.now();
const { error: dbError } = await supabaseClient
  .from("archivos")
  .insert([{ 
    id: idUnico,
    semana_id, 
    nombre, 
    enlace 
  }]);
    
    const unidadNombre = obtenerNombreUnidad(semanaExiste.unidad_id);
    
    alert(`✅ Archivo subido correctamente!\n\n📁 Archivo: ${nombre}\n📅 Semana: ${semanaExiste.label}\n📚 ${unidadNombre}`);
    
    // Limpiar campos
    fileInput.value = "";
    document.getElementById("semana_archivo").value = "";
    document.getElementById("nombre_archivo").value = "";
    document.getElementById("file_name_window").textContent = "Ningún archivo seleccionado";
    document.getElementById("archivo-unidad-preview").style.display = "none";
    
    cargarDatos();
    
  } catch (error) {
    console.error("Error completo:", error);
    
    if (error.message.includes("duplicate") || error.message.includes("already exists")) {
      alert("❌ Ya existe un archivo con ese nombre. Cambia el nombre y vuelve a intentarlo.");
    } else if (error.message.includes("permission") || error.message.includes("policy")) {
      alert("❌ Error de permisos. Ejecuta el SQL que te proporcioné en el SQL Editor de Supabase.");
    } else if (error.message.includes("bucket") || error.message.includes("not found")) {
      alert("❌ ERROR: El bucket 'archivos' no existe.\n\nSOLUCIÓN:\n1. Ve a Storage en Supabase\n2. Crea un bucket llamado 'archivos'\n3. Marca 'Public bucket'\n4. Recarga la página");
    } else {
      alert("❌ Error al subir archivo: " + error.message);
    }
  }
};

// ========== AUTO-COMPLETAR Y PREVIEW ==========
document.addEventListener('DOMContentLoaded', function() {
  const semanaIdInput = document.getElementById('semana_id');
  const labelInput = document.getElementById('label');
  const previewDiv = document.getElementById('unidad-preview');
  
  if (semanaIdInput && labelInput && previewDiv) {
    semanaIdInput.addEventListener('input', function() {
      const match = semanaIdInput.value.match(/^semana(\d+)$/i);
      if (match) {
        const num = parseInt(match[1]);
        labelInput.value = `Semana ${num}`;
        
        if (num >= 1 && num <= 16) {
          const colores = obtenerColorUnidad(num);
          previewDiv.style.display = "block";
          previewDiv.style.backgroundColor = colores.bg;
          previewDiv.style.border = `1px solid ${colores.border}`;
          previewDiv.style.color = colores.text;
          
          if (num >= 1 && num <= 4) previewDiv.innerHTML = `✨ Semana ${num} → Unidad 1 (u1)`;
          else if (num >= 5 && num <= 8) previewDiv.innerHTML = `✨ Semana ${num} → Unidad 2 (u2)`;
          else if (num >= 9 && num <= 12) previewDiv.innerHTML = `✨ Semana ${num} → Unidad 3 (u3)`;
          else if (num >= 13 && num <= 16) previewDiv.innerHTML = `✨ Semana ${num} → Unidad 4 (u4)`;
        } else {
          previewDiv.style.display = "none";
        }
      } else {
        previewDiv.style.display = "none";
      }
    });
  }
  
  const semanaArchivoInput = document.getElementById('semana_archivo');
  const archivoPreviewDiv = document.getElementById('archivo-unidad-preview');
  
  if (semanaArchivoInput && archivoPreviewDiv) {
    semanaArchivoInput.addEventListener('input', function() {
      const match = semanaArchivoInput.value.match(/^semana(\d+)$/i);
      if (match) {
        const num = parseInt(match[1]);
        const colores = obtenerColorUnidad(num);
        
        archivoPreviewDiv.style.display = "block";
        archivoPreviewDiv.style.backgroundColor = colores.bg;
        archivoPreviewDiv.style.border = `1px solid ${colores.border}`;
        archivoPreviewDiv.style.color = colores.text;
        
        if (num >= 1 && num <= 4) archivoPreviewDiv.innerHTML = `📌 Esta semana pertenece a la Unidad 1`;
        else if (num >= 5 && num <= 8) archivoPreviewDiv.innerHTML = `📌 Esta semana pertenece a la Unidad 2`;
        else if (num >= 9 && num <= 12) archivoPreviewDiv.innerHTML = `📌 Esta semana pertenece a la Unidad 3`;
        else if (num >= 13 && num <= 16) archivoPreviewDiv.innerHTML = `📌 Esta semana pertenece a la Unidad 4`;
        else archivoPreviewDiv.style.display = "none";
      } else {
        archivoPreviewDiv.style.display = "none";
      }
    });
  }
  
  const fileInput = document.getElementById('file_input_window');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      document.getElementById('file_name_window').textContent = e.target.files[0]?.name || 'Ningún archivo seleccionado';
    });
  }
  
  window.onclick = function(event) {
    if (event.target === document.getElementById("adminModalWindow")) cerrarAdminWindow();
    if (event.target === document.getElementById("admin-login-modal")) window.cerrarModalAdmin();
  };
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarAdminWindow();
      window.cerrarModalAdmin();
    }
  });
});

// Cambiar texto del header
const frases = ["✨ Base de Datos II ✨", "📊 Optimización SQL", "💻 Full Stack Developer", "🐘 PostgreSQL & MySQL", "🎓 Ingeniería de Sistemas"];
let indiceFrase = 0;
const headerTitle = document.querySelector('.header-text p');
if (headerTitle) {
  setInterval(() => {
    indiceFrase = (indiceFrase + 1) % frases.length;
    headerTitle.style.opacity = '0';
    setTimeout(() => {
      headerTitle.textContent = frases[indiceFrase];
      headerTitle.style.opacity = '1';
    }, 300);
  }, 4000);
}

// INICIALIZACIÓN
document.getElementById('footer-year').textContent = new Date().getFullYear();

// Verificar si ya hay sesión admin guardada (para mostrar botón "Salir" si ya estaba logueado)
if (localStorage.getItem("admin") === "true") {
  esAdmin = true;
  document.getElementById("logout-btn").style.display = "inline-block";
}
// ========== EDITAR Y ELIMINAR UNIDADES ==========

window.editarUnidad = async function(id, nombreActual) {
  const nuevoNombre = prompt("Editar nombre de la unidad:", nombreActual);
  
  if (!nuevoNombre || nuevoNombre.trim() === '') {
    return;
  }
  
  const { error } = await supabaseClient
    .from("unidades")
    .update({ nombre: nuevoNombre.trim() })
    .eq("id", id);
  
  if (error) {
    alert("❌ Error al editar: " + error.message);
  } else {
    alert("✅ Unidad actualizada correctamente");
    cargarDatos();
  }
};

window.eliminarUnidad = async function(id) {
  const confirmar = confirm("⚠️ ¿Estás seguro de eliminar esta unidad?\n\nSe eliminarán TODAS las semanas y archivos asociados.\n\nEsta acción NO se puede deshacer.");
  
  if (!confirmar) return;
  
  try {
    // 1. Obtener semanas de esta unidad
    const { data: semanas } = await supabaseClient
      .from("semanas")
      .select("id")
      .eq("unidad_id", id);
    
    // 2. Eliminar archivos de cada semana
    if (semanas && semanas.length > 0) {
      for (const semana of semanas) {
        await supabaseClient
          .from("archivos")
          .delete()
          .eq("semana_id", semana.id);
      }
      
      // 3. Eliminar semanas
      await supabaseClient
        .from("semanas")
        .delete()
        .eq("unidad_id", id);
    }
    
    // 4. Eliminar unidad
    const { error } = await supabaseClient
      .from("unidades")
      .delete()
      .eq("id", id);
    
    if (error) {
      alert("❌ Error al eliminar: " + error.message);
    } else {
      alert("✅ Unidad eliminada correctamente");
      cargarDatos();
    }
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
};
cargarDatos();