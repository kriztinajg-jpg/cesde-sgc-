import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCarpi } from '../components/Carpi';
import { AREAS, CATEGORIAS, areaInfo } from '../data/estructura';
import { listarDocumentos } from '../services/documentosApi';

// Vista de un área: el archivador con sus 7 carpetas (procesoId es el id del área)
export default function VistaProceso() {
    const { procesoId } = useParams();
    const navigate = useNavigate();
    const { decir } = useCarpi();
    const areaId = Number(procesoId);
    const existe = Boolean(AREAS[areaId]);
    const [docs, setDocs] = useState(null);

    useEffect(() => {
        if (!existe) return undefined;
        let cancelado = false;
        listarDocumentos({ areaId })
            .then((l) => { if (!cancelado) setDocs(l); })
            .catch(() => { if (!cancelado) setDocs([]); });
        return () => { cancelado = true; };
    }, [areaId, existe]);

    useEffect(() => {
        if (docs) decir(docs.length ? 'Elige una carpeta. ¡Las vacías esperan su primer documento!' : 'Este archivador aún está vacío. ¡Abre una carpeta y sube algo!');
    }, [docs, decir]);

    if (!existe) return <p>No encontramos esa área. <Link to="/" className="back">← Volver a la ciudad</Link></p>;
    const { nombre, proceso } = areaInfo(areaId);
    const cuenta = (catId) => (docs || []).filter((d) => d.categoriaId === catId).length;

    return (
        <>
            <div className="ahead" style={{ '--c': proceso.color }}>
                <button className="back" onClick={() => navigate('/')}>← Volver a la ciudad</button><br />
                <span className="tag">{proceso.nombre}</span>
                <h1>{nombre}</h1>
                <p>Abre una carpeta del archivador para ver, subir y descargar documentos.</p>
            </div>
            <div className="cab">
                <div className="cabtop" style={{ '--c': proceso.color }}>Archivador · {nombre}</div>
                <div className="drawer">
                    <div className="folders">
                        {CATEGORIAS.map((c, i) => {
                            const k = cuenta(c.id);
                            return (
                                <button key={c.id} className={`fold${k ? '' : ' vacia'}`} style={{ '--i': i, '--f': c.color }}
                                        aria-label={`${c.nombre}, ${k ? `${k} documentos` : 'vacía'}`} onClick={() => navigate(`/proceso/${areaId}/categoria/${c.id}`)}>
                                    <span className="ftab">{c.icono}</span>
                                    <span className="fbody"><b>{c.nombre}</b><small>{k ? `${k} documento${k > 1 ? 's' : ''}` : 'Vacía'}</small></span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="handle" />
                </div>
            </div>
        </>
    );
}