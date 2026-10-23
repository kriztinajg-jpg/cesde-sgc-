import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CiudadCesde from '../components/CiudadCesde';
import { useCarpi } from '../components/Carpi';
import { PROCESOS } from '../data/estructura';

export default function Home() {
    const navigate = useNavigate();
    const { decir } = useCarpi();
    const [sel, setSel] = useState(null);

    useEffect(() => { decir('¡Hola! Soy Carpi. Toca un edificio para entrar a un área.'); }, [decir]);

    function elegir(tipo) {
        const nuevo = sel === tipo ? null : tipo;
        const p = PROCESOS.find((x) => x.tipo === nuevo);
        setSel(nuevo);
        decir(p ? `${p.nombre}: ${p.desc}` : '¡Hola! Soy Carpi. Toca un edificio para entrar a un área.');
    }

    return (
        <>
            <section className="hero">
                <h1>Ciudad CESDE</h1>
                <p>Cada edificio es un área. Toca uno para entrar a su archivador y ver, subir o descargar documentos.</p>
            </section>
            <div className="pills" style={{ justifyContent: 'center', margin: '18px 0 10px' }}>
                {PROCESOS.map((p) => (
                    <button key={p.tipo} className={`pill${sel === p.tipo ? ' on' : ''}`} style={{ '--c': p.color }} onClick={() => elegir(p.tipo)}>{p.nombre}</button>
                ))}
            </div>
            <section className="stage2"><CiudadCesde seleccion={sel} alEntrar={(id) => navigate(`/proceso/${id}`)} /></section>
            <div className="notes">
                <p className="note">Diseñamos rutas de aprendizaje para generar movilidad y progreso social. Satisfacemos las necesidades de formación de las empresas altamente productivas y conscientes.</p>
                <p className="note">Egresados altamente calificados para atender las exigencias del mercado laboral y productivo, con habilidades técnicas y humanas potenciadas.</p>
            </div>
        </>
    );
}