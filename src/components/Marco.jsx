import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/Sesion';
import { AREAS, CATEGORIAS } from '../data/estructura';
import { ETIQUETA_ROL } from '../services/authApi';
import { listarDocumentos } from '../services/documentosApi';

// Encabezado con buscador, usuario conectado y cierre de sesión
export function Cabecera() {
    const [q, setQ] = useState('');
    const [docs, setDocs] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, cargando, esAdministrador, puedeVerArea, cerrarSesion } = useSesion();
    const texto = q.trim().toLowerCase();
    const hayBusqueda = Boolean(usuario) && texto.length >= 2;

    useEffect(() => {
        if (!hayBusqueda) return undefined;
        const t = setTimeout(() => listarDocumentos({ q: texto }).then(setDocs).catch(() => setDocs([])), 250);
        return () => clearTimeout(t);
    }, [hayBusqueda, texto]);

    // Solo se buscan las áreas que esta persona puede ver; los documentos ya vienen filtrados por el backend
    const areas = usuario && texto
        ? Object.entries(AREAS).filter(([id, n]) => puedeVerArea(Number(id)) && n.toLowerCase().includes(texto))
        : [];
    const documentos = hayBusqueda ? docs.slice(0, 6) : [];
    const ir = (ruta) => { setQ(''); navigate(ruta); };

    async function salir() {
        await cerrarSesion();
        setQ('');
        navigate('/login');
    }

    return (
        <header className="glass-header-container">
            <div className="glass-header">
                {/* Marca / Logo */}
                <div className="brand-zone">
                    <Link to="/" className="brand-logo" aria-label="Ir al inicio">CESDE</Link>
                    <span className="brand-subtitle">Ciudad CESDE</span>
                </div>

                {/* Buscador Central (solo con sesión) */}
                <div className="search-zone">
                    {usuario && (
                        <div className="search-box-pill">
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Buscar áreas o documentos…"
                                aria-label="Buscar áreas o documentos"
                                autoComplete="off"
                            />
                            <span className="search-icon" aria-hidden="true">🔍</span>

                            {texto && (
                                <div id="res">
                                    {areas.map(([id, n]) => <button key={`a${id}`} onClick={() => ir(`/proceso/${id}`)}>{n} <i>· Área</i></button>)}
                                    {documentos.map((d) => <button key={`d${d.id}`} onClick={() => ir(`/proceso/${d.areaId}/categoria/${d.categoriaId}`)}>{d.titulo} <i>· {AREAS[d.areaId]} · {CATEGORIAS.find((c) => c.id === d.categoriaId)?.nombre}</i></button>)}
                                    {!areas.length && !documentos.length && <button disabled>Sin resultados. Prueba con otra palabra.</button>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Zona de Usuario / Acceso Externo */}
                <div className="user-zone">
                    <a className="external-link-btn" href="https://cesde.edu.co" target="_blank" rel="noopener noreferrer">cesde.edu.co ↗</a>

                    {usuario && (
                        <>
                            {esAdministrador && <Link className="external-link-btn" to="/usuarios">👥 Usuarios</Link>}
                            <div className="user-badge flex items-center gap-2">
                                <div className="user-avatar">{usuario.nombre.charAt(0).toUpperCase()}</div>
                                <div className="user-info">
                                    <span className="user-name">{usuario.nombre}</span>
                                    <span className="user-role">({ETIQUETA_ROL[usuario.rol] ?? usuario.rol})</span>
                                </div>
                                <button
                                    onClick={salir}
                                    title="Cerrar sesión"
                                    aria-label="Cerrar sesión"
                                    className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    🚪
                                </button>
                            </div>
                        </>
                    )}

                    {/* Sin sesión: botón para ingresar (o para volver a la ciudad si ya estás en el login) */}
                    {!usuario && !cargando && (location.pathname === '/login' ? (
                        <button className="login-btn-pill" onClick={() => navigate('/')}>
                            <span>🏠 Volver al inicio</span>
                        </button>
                    ) : (
                        <button className="login-btn-pill" onClick={() => navigate('/login')}>
                            <span className="avatar-placeholder">👤</span>
                            <span>Iniciar sesión</span>
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}

const SEDES = ['Medellín: Calle 49 41 - 9.', 'Bello: Diagonal 50a #38-20 (Tierragro), piso 5.', 'Rionegro: Calle 52 #48-51, Rionegro (también vía Llano Grande, entrada a Tutucán)',
    'Apartadó: Calle 104 #101-15 Barrio Vélez', 'Bogotá: AK 14 63-09.', 'Cartagena: Transversal 54 #21A 104 Local 102'];
const Enlace = ({ t, href = 'https://cesde.edu.co' }) => <li><a href={href} target="_blank" rel="noopener noreferrer">{t}</a></li>;

// Pie de página original intacto
export function PieDePagina() {
    const [abierto, setAbierto] = useState(false);
    const pie = useRef(null);

    function alternar() {
        const abrir = !abierto;
        setAbierto(abrir);
        if (abrir) setTimeout(() => pie.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 320);
    }

    return (
        <footer className="pie" ref={pie}>
            <div className="pie-bar">
                <span className="logo">CESDE</span>
                <small>© 2026 CESDE · Sistema de Gestión de Calidad</small>
                <button type="button" className="pie-btn" aria-expanded={abierto} aria-controls="pie-info" onClick={alternar}>
                    Contacto y sedes <span className="chev" aria-hidden="true">▾</span>
                </button>
            </div>
            <div id="pie-info" className={`pie-info${abierto ? ' open' : ''}`}>
                <div className="pie-inner">
                    <div className="pie-cols">
                        <section>
                            <h3>Atención al ciudadano</h3>
                            <ul>
                                <Enlace t="Contacto" />
                                <Enlace t="Línea de Transparencia" />
                                <Enlace t="PQRSF" />
                                <li>Línea de atención general: (604) 229 11 00 · 300 912 1163 (solo llamadas)</li>
                                <Enlace t="comunicaciones@cesde.edu.co" href="mailto:comunicaciones@cesde.edu.co" />
                                <li>Notificaciones judiciales: <a href="mailto:juridica@cesde.edu.co">juridica@cesde.edu.co</a></li>
                            </ul>
                        </section>
                        <section>
                            <h3>Sedes</h3>
                            <ul>
                                {SEDES.map((s) => <li key={s}>{s}</li>)}
                            </ul>
                        </section>
                        <section>
                            <h3>Institucional</h3>
                            <ul>
                                <Enlace t="¿Quiénes somos?" />
                                <Enlace t="Calidad" />
                                <Enlace t="Sostenibilidad" />
                                <Enlace t="Línea de Transparencia" />
                                <Enlace t="Políticas y normativas" />
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </footer>
    );
}