import { useRef, useState } from 'react';
import { areaInfo } from '../data/estructura';

// [idÁrea, x, ancho, alto, tipo de edificio]
const EDIFICIOS = [[4, 40, 104, 190, 'office'], [5, 160, 104, 230, 'shop'], [6, 280, 112, 262, 'office'], [7, 408, 104, 210, 'shop'],
    [8, 528, 104, 250, 'tower'], [2, 670, 130, 250, 'school'], [3, 815, 130, 210, 'office'], [1, 985, 100, 330, 'tower'], [9, 1100, 90, 250, 'watch']];

function Techo({ tipo, x, y, w, c }) {
    const m = x + w / 2;
    if (tipo === 'tower') return <><rect x={m - 3} y={y - 34} width="6" height="34" fill={c} /><circle className="bulb" cx={m} cy={y - 42} r="12" fill="#FFD23F" /></>;
    if (tipo === 'school') return <><path d={`M${x - 8} ${y}L${m} ${y - 34}L${x + w + 8} ${y}Z`} fill={c} /><rect x={m} y={y - 60} width="3" height="28" fill="#777" /><path d={`M${m + 3} ${y - 60}h22l-6 7 6 7h-22z`} fill="#FFD23F" /></>;
    if (tipo === 'shop') return <><rect x={x - 6} y={y - 8} width={w + 12} height="18" rx="9" fill={c} /><rect x={x - 6} y={y + 2} width={w + 12} height="8" fill="#fff" opacity=".35" /></>;
    if (tipo === 'watch') return <><path d={`M${x} ${y}a${w / 2} ${w / 2} 0 0 1 ${w} 0z`} fill={c} /><circle cx={m} cy={y - w / 2 - 16} r="13" fill="none" stroke={c} strokeWidth="5" /><line x1={m + 9} y1={y - w / 2 - 7} x2={m + 22} y2={y - w / 2 + 6} stroke={c} strokeWidth="5" strokeLinecap="round" /></>;
    return null;
}

function Edificio({ id, x, w, h, tipo, atenuado, alEntrar }) {
    const { nombre, proceso } = areaInfo(id);
    const c = proceso.color, y = 430 - h, m = x + w / 2;
    const cols = Math.floor((w - 14) / 28), rows = Math.floor((h - 60) / 36);
    const ventanas = [];
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        ventanas.push(<rect key={`${r}-${k}`} className={`win${(r * 7 + k * 3 + id) % 5 === 0 ? ' f' : ''}`} style={{ animationDelay: `${(r + k) * 0.7}s` }}
                            x={x + 10 + k * 28 + (w - 14 - cols * 28) / 2} y={y + 16 + r * 36} width="16" height="20" rx="3" />);
    }
    const lineas = nombre.match(/.{1,15}(\s|$)/g).map((t) => t.trim());
    const entrar = (e) => alEntrar(id, e.currentTarget);
    return (
        <g className={`bld${atenuado ? ' dim' : ''}`} tabIndex={0} role="button" aria-label={nombre} onClick={entrar}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrar(e); } }}>
            <Techo tipo={tipo} x={x} y={y} w={w} c={c} />
            <rect x={x} y={y} width={w} height={h} rx="8" style={{ fill: c }} />
            {ventanas}
            <rect x={m - 11} y="396" width="22" height="34" rx="4" fill="#fff" opacity=".85" />
            {lineas.map((t, i) => <text key={i} x={m} y={452 + i * 14} textAnchor="middle" fontSize="12" fontWeight="700" style={{ fill: 'var(--ink)' }}>{t}</text>)}
        </g>
    );
}

export default function CiudadCesde({ seleccion, alEntrar }) {
    const ref = useRef(null);
    const [origen, setOrigen] = useState(null);

    // Al tocar un edificio, la cámara se acerca a él y luego se abre su área
    function entrar(id, el) {
        const r = el.getBoundingClientRect(), q = ref.current.getBoundingClientRect();
        setOrigen(`${r.x + r.width / 2 - q.x + ref.current.scrollLeft}px ${r.y + r.height / 2 - q.y}px`);
        setTimeout(() => alEntrar(id), 420);
    }

    return (
        <div ref={ref} className={`city${origen ? ' zoom' : ''}`} style={origen ? { transformOrigin: origen } : undefined}>
            <svg viewBox="0 0 1200 520" role="group" aria-label="Ciudad con los edificios de cada área">
                <rect width="1200" height="520" style={{ fill: 'var(--soft)' }} />
                <g className="cl" style={{ animationDuration: '60s' }}><ellipse cx="120" cy="70" rx="60" ry="20" fill="#fff" opacity=".8" /><ellipse cx="160" cy="58" rx="40" ry="18" fill="#fff" opacity=".8" /></g>
                <g className="cl" style={{ animationDuration: '85s', animationDelay: '-30s' }}><ellipse cx="520" cy="40" rx="70" ry="22" fill="#fff" opacity=".7" /><ellipse cx="565" cy="28" rx="44" ry="18" fill="#fff" opacity=".7" /></g>
                <g className="cl" style={{ animationDuration: '100s', animationDelay: '-60s' }}><ellipse cx="900" cy="95" rx="55" ry="18" fill="#fff" opacity=".6" /></g>
                <rect y="430" width="1200" height="90" fill="#8CCBB0" />
                <rect y="466" width="1200" height="30" fill="#5b6272" />
                <line className="dash" x1="0" y1="481" x2="1200" y2="481" stroke="#fff" strokeWidth="3" strokeDasharray="14 10" />
                {EDIFICIOS.map(([id, x, w, h, tipo]) => (
                    <Edificio key={id} id={id} x={x} w={w} h={h} tipo={tipo} alEntrar={entrar}
                              atenuado={!!seleccion && areaInfo(id).proceso.tipo !== seleccion} />
                ))}
                <g className="train">
                    {['#E71873', '#3BA9E8', '#EE6A3A'].map((col, i) => (
                        <g key={col}><rect x={i * 32} y="470" width="26" height="22" rx="4" fill="#fff" /><rect x={i * 32} y="470" width="26" height="6" rx="3" fill={col} /></g>
                    ))}
                </g>
            </svg>
        </div>
    );
}