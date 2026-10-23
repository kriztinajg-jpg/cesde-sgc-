import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AREAS, CATEGORIAS } from '../data/estructura';
import { listarDocumentos } from '../services/documentosApi';

// Franja negra + encabezado con buscador (áreas y documentos)
export function Cabecera() {
    const [q, setQ] = useState('');
    const [docs, setDocs] = useState([]);
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
        <>
            <div className="top"><span>SIG Documental · Sistema de Gestión de Calidad</span><a href="https://cesde.edu.co" target="_blank" rel="noopener noreferrer">Ir a cesde.edu.co ↗</a></div>
            <header>
                <Link to="/" className="logo" aria-label="Ir al inicio">CESDE</Link>
                <small>SIG Documental</small>
                <div className="sw">
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar áreas o documentos…" aria-label="Buscar áreas o documentos" autoComplete="off" />
                    {texto && (
                        <div id="res">
                            {areas.map(([id, n]) => <button key={`a${id}`} onClick={() => ir(`/proceso/${id}`)}>{n} <i>· Área</i></button>)}
                            {documentos.map((d) => <button key={`d${d.id}`} onClick={() => ir(`/proceso/${d.areaId}/categoria/${d.categoriaId}`)}>{d.titulo} <i>· {AREAS[d.areaId]} · {CATEGORIAS.find((c) => c.id === d.categoriaId)?.nombre}</i></button>)}
                            {!areas.length && !documentos.length && <button disabled>Sin resultados. Prueba con otra palabra.</button>}
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

const SEDES = ['Medellín: Calle 49 41 - 9.', 'Bello: Diagonal 50a #38-20 (Tierragro), piso 5.', 'Rionegro: Calle 52 #48-51, Rionegro (también vía Llano Grande, entrada a Tutucán)',
    'Apartadó: Calle 104 #101-15 Barrio Vélez', 'Bogotá: AK 14 63-09.', 'Cartagena: Transversal 54 #21A 104 Local 102'];
const Enlace = ({ t, href = 'https://cesde.edu.co' }) => <li><a href={href} target="_blank" rel="noopener noreferrer">{t}</a></li>;

export function PieDePagina() {
    return (
        <footer className="foot">
            <div className="fgrid">
                <section><h3>Atención al ciudadano</h3><ul>
                    <Enlace t="Contacto" /><Enlace t="Línea de Transparencia" /><Enlace t="PQRSF" />
                    <li>Línea de atención general: (604) 229 11 00 · 300 912 1163 (solo llamadas)</li>
                    <Enlace t="comunicaciones@cesde.edu.co" href="mailto:comunicaciones@cesde.edu.co" />
                    <li>Notificaciones judiciales: <a href="mailto:juridica@cesde.edu.co">juridica@cesde.edu.co</a></li>
                </ul></section>
                <section><h3>Sedes</h3><ul>{SEDES.map((s) => <li key={s}>{s}</li>)}</ul></section>
                <section><h3>Institucional</h3><ul>
                    <Enlace t="¿Quiénes somos?" /><Enlace t="Calidad" /><Enlace t="Sostenibilidad" /><Enlace t="Línea de Transparencia" /><Enlace t="Políticas y normativas" />
                </ul></section>
            </div>
            <div className="fbar"><span className="logo">CESDE</span><small>© 2026 CESDE · SIG Documental · Sistema de Gestión de Calidad</small></div>
        </footer>
    );
}