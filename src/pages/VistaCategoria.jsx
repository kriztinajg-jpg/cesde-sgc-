import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCarpi } from '../components/Carpi';
import SubirDocumentoModal from '../components/SubirDocumentoModal';
import VisorDocumentoModal from '../components/VisorDocumentoModal';
import { AREAS, CATEGORIAS, areaInfo } from '../data/estructura';
import { formatearFecha, listarDocumentos, urlArchivo } from '../services/documentosApi';

// Convierte un documento de la API al formato de la tabla y del visor
const desdeApi = (d) => ({
    id: d.id, codigo: `DOC-${String(d.id).padStart(4, '0')}`, nombre: d.titulo, descripcion: d.descripcion,
    version: d.version, fecha: d.fechaActualizacion, tipo: d.tipoArchivo, tamano: d.tamanoBytes, demo: false,
});

export default function VistaCategoria() {
    const { procesoId, categoriaId } = useParams();
    const navigate = useNavigate();
    const { decir, confeti } = useCarpi();
    const areaId = Number(procesoId), catId = Number(categoriaId);
    const cat = CATEGORIAS.find((c) => c.id === catId);
    const existe = Boolean(AREAS[areaId] && cat);

    const [docs, setDocs] = useState(null);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [ver, setVer] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [aviso, setAviso] = useState('');
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        if (!existe) return undefined;
        let cancelado = false;
        listarDocumentos({ areaId, categoriaId: catId })
            .then((l) => { if (!cancelado) { setDocs(l.map(desdeApi)); setError(''); } })
            .catch((e) => { if (!cancelado) { setDocs([]); setError(e.message); } });
        return () => { cancelado = true; };
    }, [areaId, catId, recarga, existe]);

    useEffect(() => {
        if (docs) decir(docs.length ? 'Aquí tienes. Puedes ver, bajar o subir archivos.' : 'Esta carpeta está vacía… ¡sube el primer documento!', docs.length ? '' : 'sad');
    }, [docs, decir]);

    if (!existe) return <p>No encontramos esa carpeta. <Link to="/" className="back">← Volver a la ciudad</Link></p>;
    const { nombre, proceso } = areaInfo(areaId);

    function alSubir(creado) {
        setSubiendo(false);
        setAviso(`«${creado.titulo}» se subió correctamente.`);
        confeti();
        decir('¡Listo! Tu documento ya quedó guardado.', 'happy');
        setDocs(null);
        setRecarga((n) => n + 1);
    }

    const abrirSubida = () => { setAviso(''); setSubiendo(true); };
    const filtrados = (docs || []).filter((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <>
            <div className="ahead" style={{ '--c': proceso.color }}>
                <button className="back" onClick={() => navigate(`/proceso/${areaId}`)}>← Volver a {nombre}</button><br />
                <span className="tag">{nombre}</span>
                <h1>{cat.nombre}</h1>
            </div>
            <div className="chips">
                {CATEGORIAS.map((c) => <button key={c.id} className={`chip${c.id === catId ? ' on' : ''}`} onClick={() => navigate(`/proceso/${areaId}/categoria/${c.id}`)}>{c.nombre}</button>)}
            </div>
            <div className="bar">
                <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en esta categoría…" aria-label="Buscar en esta categoría" />
                <button className="btn" onClick={abrirSubida}>+ Subir documento</button>
            </div>
            {aviso && <p role="status" className="okm">{aviso}</p>}
            {error && <p role="alert" className="err">{error}</p>}

            {docs === null ? <div className="emp"><p>Cargando documentos…</p></div>
                : filtrados.length > 0 ? (
                    <div className="tbl"><table>
                        <thead><tr><th>Código</th><th>Nombre</th><th>Versión</th><th>Tipo</th><th>Actualizado</th><th>Acciones</th></tr></thead>
                        <tbody>{filtrados.map((d) => (
                            <tr key={d.id}>
                                <td><code>{d.codigo}</code></td><td>{d.nombre}</td><td>{d.version}</td>
                                <td><span className="ty">{d.tipo ? d.tipo.toUpperCase() : '—'}</span></td><td>{formatearFecha(d.fecha)}</td>
                                <td><button className="btn" onClick={() => setVer(d)}>Ver</button>{' '}
                                    <a className="btn o" style={{ display: 'inline-block', textDecoration: 'none' }} href={urlArchivo(d.id, true)}>Descargar</a></td>
                            </tr>))}</tbody>
                    </table></div>
                ) : docs.length > 0 ? (
                    <div className="emp"><h2>Ningún documento coincide</h2><p>Prueba con otra palabra.</p></div>
                ) : (
                    <div className="emp">
                        <span className="ico">📂</span>
                        <h2>Aún no hay documentos en {cat.nombre}</h2>
                        <p>Esta categoría todavía no tiene archivos cargados para {nombre}.</p>
                        <button className="btn" onClick={abrirSubida}>+ Subir documento</button>{' '}
                        <button className="btn o" onClick={() => navigate(`/proceso/${areaId}`)}>Volver a categorías</button>
                    </div>
                )}

            {ver && <VisorDocumentoModal doc={ver} onClose={() => setVer(null)} />}
            {subiendo && <SubirDocumentoModal areaId={areaId} categoriaId={catId} categoriaNombre={cat.nombre} onClose={() => setSubiendo(false)} onSubido={alSubir} />}
        </>
    );
}