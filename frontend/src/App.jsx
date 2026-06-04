import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================
  const [plantas, setPlantas] = useState([]);
  const [tiposPlanta, setTiposPlanta] = useState([]);
  const [vistaActual, setVistaActual] = useState('plantas');
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // ========================================
  // ESTADOS FORMULARIO PLANTA
  // ========================================
  const [idPlantaEditar, setIdPlantaEditar] = useState(null);
  const [nombreComun, setNombreComun] = useState('');
  const [especieCientifica, setEspecieCientifica] = useState('');
  const [cuidados, setCuidados] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipoPlantaSeleccionado, setTipoPlantaSeleccionado] = useState('');
  const [previewImagen, setPreviewImagen] = useState('');

  // ========================================
  // ESTADOS FORMULARIO TIPO
  // ========================================
  const [idTipoEditar, setIdTipoEditar] = useState(null);
  const [nombreTipo, setNombreTipo] = useState('');
  const [descripcionTipo, setDescripcionTipo] = useState('');
  const [codigoCategoria, setCodigoCategoria] = useState('');

  // ========================================
  // ESTADOS MODALES
  // ========================================
  const [mostrarModalPlanta, setMostrarModalPlanta] = useState(false);
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(null);

  // ========================================
  // CARGA INICIAL
  // ========================================
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => setNotificacion(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resPlantas, resTipos] = await Promise.all([
        fetch('https://catalogo-plantas-backend.onrender.com/api/plantas/'),
        fetch('https://catalogo-plantas-backend.onrender.com/api/tipos-planta/'),
      ]);
      if (resPlantas.ok) setPlantas(await resPlantas.json());
      if (resTipos.ok) setTiposPlanta(await resTipos.json());
    } catch (err) {
      mostrarNotificacion('Error al cargar los datos', 'error');
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // NOTIFICACIONES TOAST
  // ========================================
  const mostrarNotificacion = (mensaje, tipo = 'exito') => {
    setNotificacion({ mensaje, tipo, id: Date.now() });
  };

  // ========================================
  // FILTRADO Y BÚSQUEDA EN VIVO
  // ========================================
  const plantasFiltradas = useMemo(() => {
    return plantas.filter((p) => {
      const coincideBusqueda =
        p.nombre_comun.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.especie_cientifica || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === 'todos' || p.tipo_planta === parseInt(filtroTipo);
      return coincideBusqueda && coincideTipo;
    });
  }, [plantas, busqueda, filtroTipo]);

  // ========================================
  // ESTADÍSTICAS
  // ========================================
  const estadisticas = useMemo(() => {
    const totalPlantas = plantas.length;
    const totalTipos = tiposPlanta.length;
    const valorInventario = plantas.reduce((acc, p) => acc + parseFloat(p.precio || 0), 0);
    const tipoMasUsado = [...tiposPlanta].sort((a, b) => (b.total_plantas || 0) - (a.total_plantas || 0))[0];
    return { totalPlantas, totalTipos, valorInventario, tipoMasUsado };
  }, [plantas, tiposPlanta]);

  // ========================================
  // CRUD PLANTAS
  // ========================================
  const abrirFormularioPlanta = (planta = null) => {
    if (planta) {
      setIdPlantaEditar(planta.id);
      setNombreComun(planta.nombre_comun);
      setEspecieCientifica(planta.especie_cientifica || '');
      setCuidados(planta.cuidados);
      setPrecio(planta.precio);
      setTipoPlantaSeleccionado(planta.tipo_planta);
      setPreviewImagen(planta.imagen || '');
    } else {
      setIdPlantaEditar(null);
      setNombreComun('');
      setEspecieCientifica('');
      setCuidados('');
      setPrecio('');
      setTipoPlantaSeleccionado(tiposPlanta[0]?.id || '');
      setPreviewImagen('');
    }
    setMostrarModalPlanta(true);
  };

  const guardarPlanta = async (e) => {
    e.preventDefault();

    const payload = {
      nombre_comun: nombreComun.trim(),
      cuidados: cuidados.trim(),
      precio: parseFloat(precio),
      tipo_planta: parseInt(tipoPlantaSeleccionado),
      imagen: previewImagen.trim() || null,
    };

    if (especieCientifica && especieCientifica.trim() !== '') {
      payload.especie_cientifica = especieCientifica.trim();
    }

    const url = idPlantaEditar
      ? `https://catalogo-plantas-backend.onrender.com/api/plantas/${idPlantaEditar}/`
      : 'https://catalogo-plantas-backend.onrender.com/api/plantas/';

    const method = idPlantaEditar ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMostrarModalPlanta(false);
        cargarDatos();
        mostrarNotificacion(
          idPlantaEditar ? 'Planta actualizada correctamente' : 'Planta creada correctamente',
          'exito'
        );
      } else {
        const errores = await res.json();
        const mensajeError = Object.entries(errores)
          .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(', ') : mensajes}`)
          .join(' | ');
        mostrarNotificacion(mensajeError || 'Error al guardar', 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión con el servidor', 'error');
    }
  };

  const solicitarEliminarPlanta = (planta) => {
    setModalConfirmar({
      titulo: 'Eliminar Planta',
      mensaje: `¿Seguro que deseas eliminar "${planta.nombre_comun}"? Esta acción no se puede deshacer.`,
      tipo: 'peligro',
      onConfirmar: () => eliminarPlanta(planta.id),
    });
  };

  const eliminarPlanta = async (id) => {
    try {
      const res = await fetch(`https://catalogo-plantas-backend.onrender.com/api/plantas/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        cargarDatos();
        mostrarNotificacion('Planta eliminada', 'exito');
      }
    } catch (err) {
      mostrarNotificacion('Error al eliminar', 'error');
    }
    setModalConfirmar(null);
  };

  // ========================================
  // CRUD TIPOS
  // ========================================
  const abrirFormularioTipo = (tipo = null) => {
    if (tipo) {
      setIdTipoEditar(tipo.id);
      setNombreTipo(tipo.nombre);
      setDescripcionTipo(tipo.descripcion || '');
      setCodigoCategoria(tipo.codigo_categoria || '');
    } else {
      setIdTipoEditar(null);
      setNombreTipo('');
      setDescripcionTipo('');
      setCodigoCategoria('');
    }
    setMostrarModalTipo(true);
  };

  const guardarTipoPlanta = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: nombreTipo,
      descripcion: descripcionTipo,
      codigo_categoria: codigoCategoria,
    };
    const url = idTipoEditar
      ? `https://catalogo-plantas-backend.onrender.com/api/tipos-planta/${idTipoEditar}/`
      : 'https://catalogo-plantas-backend.onrender.com/api/tipos-planta/';
    const method = idTipoEditar ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMostrarModalTipo(false);
        cargarDatos();
        mostrarNotificacion(
          idTipoEditar ? 'Tipo actualizado' : 'Tipo creado correctamente',
          'exito'
        );
      } else {
        const errores = await res.json();
        mostrarNotificacion(Object.values(errores).flat().join(' | '), 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión', 'error');
    }
  };

  const solicitarEliminarTipo = (tipo) => {
    setModalConfirmar({
      titulo: 'Eliminar Tipo',
      mensaje: `¿Eliminar "${tipo.nombre}"? ${
        tipo.total_plantas > 0
          ? `Tiene ${tipo.total_plantas} plantas asociadas.`
          : 'Esta acción no se puede deshacer.'
      }`,
      tipo: 'peligro',
      onConfirmar: () => eliminarTipoPlanta(tipo.id),
    });
  };

  const eliminarTipoPlanta = async (id) => {
    try {
      const res = await fetch(`https://catalogo-plantas-backend.onrender.com/api/tipos-planta/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        cargarDatos();
        mostrarNotificacion('Tipo eliminado', 'exito');
      } else {
        mostrarNotificacion('No se puede eliminar: tiene plantas asociadas', 'error');
      }
    } catch (err) {
      mostrarNotificacion('Error al eliminar', 'error');
    }
    setModalConfirmar(null);
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex font-sans">
      {/* OVERLAY MÓVIL */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 z-40 transform transition-transform duration-300 ease-out ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shadow-2xl md:shadow-lg flex flex-col`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🌿
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BioPanel</h1>
              <p className="text-xs text-emerald-300">Gestión Botánica</p>
            </div>
          </div>
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarAbierto(false)}
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <p className="text-xs uppercase text-emerald-400 font-semibold tracking-wider mb-3 px-3">
            Menú Principal
          </p>
          <button
            onClick={() => {
              setVistaActual('plantas');
              setSidebarAbierto(false);
            }}
            className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-200 font-medium flex items-center gap-3 group ${
              vistaActual === 'plantas'
                ? 'bg-white/15 shadow-lg backdrop-blur-sm border border-white/10'
                : 'hover:bg-white/10 text-emerald-100'
            }`}
          >
            <span className="text-xl">📋</span>
            <span>Catálogo de Plantas</span>
            {vistaActual === 'plantas' && (
              <span className="ml-auto w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => {
              setVistaActual('tipos');
              setSidebarAbierto(false);
            }}
            className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-200 font-medium flex items-center gap-3 group ${
              vistaActual === 'tipos'
                ? 'bg-white/15 shadow-lg backdrop-blur-sm border border-white/10'
                : 'hover:bg-white/10 text-emerald-100'
            }`}
          >
            <span className="text-xl">🌱</span>
            <span>Tipos de Planta</span>
            {vistaActual === 'tipos' && (
              <span className="ml-auto w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            )}
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-emerald-300 mb-1">Sistema activo</p>
            <p className="text-sm font-semibold">v1.0.0 · {plantas.length} plantas</p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0">
        <header className="flex justify-between items-center mb-6 md:mb-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              onClick={() => setSidebarAbierto(true)}
            >
              <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                {vistaActual === 'plantas' ? 'Catálogo de Plantas' : 'Tipos de Planta'}
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                Sistema centralizado de gestión botánica
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              vistaActual === 'plantas' ? abrirFormularioPlanta() : abrirFormularioTipo()
            }
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5 px-4 sm:px-5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            <span className="text-lg">+</span>
            <span className="hidden sm:inline">{vistaActual === 'plantas' ? 'Nueva Planta' : 'Nuevo Tipo'}</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </header>

        {/* VISTA: PLANTAS */}
        {vistaActual === 'plantas' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard icon="🌿" label="Total Plantas" value={estadisticas.totalPlantas} color="emerald" />
              <StatCard icon="📂" label="Categorías" value={estadisticas.totalTipos} color="teal" />
              <StatCard icon="💰" label="Valor Inventario" value={`$${estadisticas.valorInventario.toFixed(2)}`} color="amber" />
              <StatCard icon="⭐" label="Más Popular" value={estadisticas.tipoMasUsado?.nombre || '—'} color="rose" small />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre o especie..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="todos">Todas las categorías</option>
                {tiposPlanta.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setVistaGrid(true)}
                  className={`p-2 rounded-lg transition ${vistaGrid ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista cuadrícula"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setVistaGrid(false)}
                  className={`p-2 rounded-lg transition ${!vistaGrid ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Vista lista"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : plantasFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {busqueda || filtroTipo !== 'todos' ? 'No se encontraron resultados' : 'Aún no hay plantas'}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {busqueda || filtroTipo !== 'todos' ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera planta al catálogo'}
                </p>
                {!busqueda && filtroTipo === 'todos' && (
                  <button
                    onClick={() => abrirFormularioPlanta()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition"
                  >
                    + Agregar primera planta
                  </button>
                )}
              </div>
            ) : vistaGrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {plantasFiltradas.map((planta, idx) => (
                  <div
                    key={planta.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
                  >
                    <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                      {planta.imagen ? (
                        <img
                          src={planta.imagen}
                          alt={planta.nombre_comun}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-300 text-6xl">🌿</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-emerald-800 font-semibold text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {planta.tipo_planta_nombre}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-gray-800 line-clamp-1 mb-0.5">{planta.nombre_comun}</h4>
                      <p className="text-xs text-gray-400 italic mb-3 line-clamp-1">{planta.especie_cientifica || 'Sin especie asignada'}</p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">{planta.cuidados}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          ${parseFloat(planta.precio).toFixed(2)}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => abrirFormularioPlanta(planta)}
                            className="p-2 bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white rounded-lg transition"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => solicitarEliminarPlanta(planta)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {plantasFiltradas.map((planta, idx) => (
                    <div
                      key={planta.id}
                      className="flex items-center gap-4 p-4 hover:bg-emerald-50/30 transition group"
                      style={{ animation: `fadeInUp 0.3s ease-out ${idx * 0.03}s both` }}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden flex-shrink-0">
                        {planta.imagen ? (
                          <img src={planta.imagen} alt={planta.nombre_comun} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{planta.nombre_comun}</h4>
                        <p className="text-xs text-gray-400 italic truncate">{planta.especie_cientifica || 'Sin especie'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{planta.tipo_planta_nombre}</span>
                          <span className="text-xs text-gray-400 line-clamp-1">{planta.cuidados}</span>
                        </div>
                      </div>
                      <span className="text-lg font-black text-emerald-600 hidden sm:block">
                        ${parseFloat(planta.precio).toFixed(2)}
                      </span>
                      <div className="flex gap-1.5">
                        <button onClick={() => abrirFormularioPlanta(planta)} className="p-2 bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => solicitarEliminarPlanta(planta)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* VISTA: TIPOS */}
        {vistaActual === 'tipos' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100 text-gray-600 font-semibold text-sm">
                    <th className="p-4">Nombre</th>
                    <th className="p-4 hidden sm:table-cell">Código</th>
                    <th className="p-4 hidden md:table-cell">Descripción</th>
                    <th className="p-4 text-center">Plantas</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
                  {tiposPlanta.map((tipo, idx) => (
                    <tr key={tipo.id} className="hover:bg-emerald-50/30 transition" style={{ animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both` }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {tipo.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{tipo.nombre}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-mono text-xs text-gray-600">{tipo.codigo_categoria || '—'}</span>
                      </td>
                      <td className="p-4 max-w-xs truncate hidden md:table-cell text-gray-500">{tipo.descripcion || 'Sin descripción'}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full">{tipo.total_plantas}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => abrirFormularioTipo(tipo)} className="p-2 bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white rounded-lg transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => solicitarEliminarTipo(tipo)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL PLANTA */}
        {mostrarModalPlanta && (
          <Modal onClose={() => setMostrarModalPlanta(false)}>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {idPlantaEditar ? '✏️ Editar Planta' : '🌱 Nueva Planta'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {idPlantaEditar ? 'Modifica los datos de la planta' : 'Completa los datos para registrar una nueva planta'}
            </p>
            <form onSubmit={guardarPlanta} className="space-y-4">
              <Input label="Nombre Común *" value={nombreComun} onChange={setNombreComun} required />
              <Input label="Especie Científica" value={especieCientifica} onChange={setEspecieCientifica} placeholder="Ej: Monstera deliciosa" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Precio *" type="number" step="0.01" value={precio} onChange={setPrecio} required prefix="$" />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Categoría *</label>
                  <select
                    value={tipoPlantaSeleccionado}
                    onChange={(e) => setTipoPlantaSeleccionado(e.target.value)}
                    className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    required
                  >
                    {tiposPlanta.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Cuidados *</label>
                <textarea
                  required
                  rows="3"
                  value={cuidados}
                  onChange={(e) => setCuidados(e.target.value)}
                  placeholder="Describe los cuidados necesarios..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">URL de la Imagen</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Pega el enlace de la imagen (Ej: https://images.unsplash.com/...)"
                    value={previewImagen}
                    onChange={(e) => setPreviewImagen(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
                  />
                  {previewImagen && (
                    <div className="border border-gray-100 rounded-xl p-2 bg-gray-50">
                      <div className="relative">
                        <img
                          src={previewImagen}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Enlace+no+valido';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImagen('')}
                          className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setMostrarModalPlanta(false)} className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition">
                  {idPlantaEditar ? 'Guardar cambios' : 'Crear planta'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL TIPO */}
        {mostrarModalTipo && (
          <Modal onClose={() => setMostrarModalTipo(false)}>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {idTipoEditar ? '✏️ Editar Tipo' : '🌱 Nuevo Tipo de Planta'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {idTipoEditar ? 'Modifica los datos del tipo' : 'Crea una nueva categoría para tus plantas'}
            </p>
            <form onSubmit={guardarTipoPlanta} className="space-y-4">
              <Input label="Nombre del Tipo *" value={nombreTipo} onChange={setNombreTipo} required />
              <Input label="Código de Categoría" value={codigoCategoria} onChange={setCodigoCategoria} placeholder="Ej: TROP-01" />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Descripción</label>
                <textarea
                  rows="3"
                  value={descripcionTipo}
                  onChange={(e) => setDescripcionTipo(e.target.value)}
                  placeholder="Describe esta categoría..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setMostrarModalTipo(false)} className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition">
                  {idTipoEditar ? 'Guardar cambios' : 'Crear tipo'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* MODAL CONFIRMAR */}
        {modalConfirmar && (
          <Modal onClose={() => setModalConfirmar(null)} small>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{modalConfirmar.titulo}</h3>
              <p className="text-gray-600 text-sm mb-6">{modalConfirmar.mensaje}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setModalConfirmar(null)} className="px-5 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition">
                  Cancelar
                </button>
                <button onClick={modalConfirmar.onConfirmar} className="px-5 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 transition">
                  Sí, eliminar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </main>

      {/* NOTIFICACIÓN */}
      {notificacion && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border ${
            notificacion.tipo === 'exito' ? 'bg-emerald-500/95 border-emerald-400 text-white' : 'bg-red-500/95 border-red-400 text-white'
          }`}
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <span className="text-xl">{notificacion.tipo === 'exito' ? '✓' : '✕'}</span>
          <span className="font-medium text-sm">{notificacion.mensaje}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color, small }) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    teal: 'from-teal-500 to-cyan-500 shadow-teal-500/30',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/30',
  };
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center text-xl group-hover:scale-110 transition`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`font-bold text-gray-800 ${small ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'} truncate`}>{value}</p>
    </div>
  );
}

function Modal({ children, onClose, small }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl w-full ${small ? 'max-w-sm' : 'max-w-md'} p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto`}
        style={{ animation: 'modalIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder, prefix, step }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">{prefix}</span>
        )}
        <input
          type={type}
          step={step}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  );
}