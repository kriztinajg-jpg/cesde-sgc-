import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CiudadCesde from '../components/CiudadCesde';
import { useCarpi } from '../components/Carpi';
import { useSesion } from '../context/Sesion';
import { PROCESOS } from '../data/estructura';

export default function Home() {
    const navigate = useNavigate();
    const { decir } = useCarpi();
    const [sel, setSel] = useState(null);
    const { usuario, puedeVerArea } = useSesion();
    // Solo los tipos de proceso que tienen al menos un área permitida para esta persona
    const saludo = usuario
        ? '¡Hola! Soy Carpi. Toca un edificio para entrar a un área.'
        : '¡Hola! Soy Carpi. Inicia sesión para entrar a tu área.';
    const visibles = usuario ? PROCESOS.filter((p) => p.areas.some((id) => puedeVerArea(id))) : PROCESOS;

    useEffect(() => { decir(saludo); }, [decir, saludo]);

    function elegir(tipo) {
        const nuevo = sel === tipo ? null : tipo;
        const p = PROCESOS.find((x) => x.tipo === nuevo);
        setSel(nuevo);
        decir(p ? `${p.nombre}: ${p.desc}` : saludo);
    }

    // Con sesión se entra al área; sin sesión, primero al login y luego al área que se tocó
    function entrarArea(id) {
        const ruta = `/proceso/${id}`;
        if (usuario) navigate(ruta);
        else navigate('/login', { state: { desde: ruta } });
    }

    return (
        <>
            <section className="hero">
                <h1>Ciudad CESDE</h1>
                <p>Cada edificio es un área. Toca uno para entrar a su archivador y ver, subir o descargar documentos.</p>
            </section>
            {!usuario && (
                <p role="status" style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>🔐 Inicia sesión para entrar a las áreas y ver los documentos.</p>
            )}
            {usuario && visibles.length === 0 && (
                <p role="status" className="err" style={{ textAlign: 'center' }}>Todavía no tienes áreas asignadas. Pídele al administrador que te las otorgue.</p>
            )}
            <div className="pills" style={{ justifyContent: 'center', margin: '18px 0 10px' }}>
                {visibles.map((p) => (
                    <button key={p.tipo} className={`pill${sel === p.tipo ? ' on' : ''}`} style={{ '--c': p.color }} onClick={() => elegir(p.tipo)}>{p.nombre}</button>
                ))}
            </div>
            <section className="stage2"><CiudadCesde seleccion={sel} alEntrar={entrarArea} /></section>
            <div className="notes">
                <p className="note">Diseñamos rutas de aprendizaje para generar movilidad y progreso social. Satisfacemos las necesidades de formación de las empresas altamente productivas y conscientes.</p>
                <p className="note">Egresados altamente calificados para atender las exigencias del mercado laboral y productivo, con habilidades técnicas y humanas potenciadas.</p>
            </div>
        </>
    );
}