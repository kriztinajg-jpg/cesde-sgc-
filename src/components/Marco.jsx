import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AREAS, CATEGORIAS } from '../data/estructura';
import { listarDocumentos } from '../services/documentosApi';

// Encabezado con buscador optimizado (lupa a la derecha y sin Ctrl+K)
export function Cabecera() {
    const [q, setQ] = useState('');
    const [docs, setDocs] = useState([]);
    const [usuario] = useState(null);
    const navigate = useNavigate();
    const texto = q.trim().toLowerCase();

    useEffect(() => {
        if (texto.length < 2) return undefined;
        const t = setTimeout(() => listarDocumentos({ q: texto }).then(setDocs).catch(() => setDocs([])), 250);
        return () => clearTimeout(t);
    }, [texto]);

    const areas = texto ? Object.entries(AREAS).filter(([, n]) => n.toLowerCase().includes(texto)) : [];
    const documentos = texto.length >= 2 ? docs.slice(0, 6) : [];
    const ir = (ruta) => { setQ(''); navigate(ruta); };

    return (
        <header className="glass-header-container">
            <div className="glass-header">
                {/* Marca / Logo */}
                <div className="brand-zone">
                    <Link to="/" className="brand-logo" aria-label="Ir al inicio">CESDE</Link>
                    <span className="brand-subtitle">Ciudad CESDE</span>
                </div>

                {/* Buscador Central (Input primero, lupa a la derecha) */}
                <div className="search-zone">
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
                </div>

                {/* Zona de Usuario / Acceso Externo */}
                <div className="user-zone">
                    <a className="external-link-btn" href="https://cesde.edu.co" target="_blank" rel="noopener noreferrer">cesde.edu.co ↗</a>

                    {usuario ? (
                        <div className="user-badge">
                            <div className="user-avatar">{usuario.nombre[0]}</div>
                            <div className="user-info">
                                <span className="user-name">{usuario.nombre}</span>
                                <span className="user-role">({usuario.rol})</span>
                            </div>
                        </div>
                    ) : (
                        <button className="login-btn-pill" onClick={() => alert('Abrir modal de login')}>
                            <span className="avatar-placeholder">👤</span>
                            <span>Iniciar sesión</span>
                        </button>
                    )}
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