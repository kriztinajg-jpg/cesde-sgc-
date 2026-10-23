import { createContext, useCallback, useContext, useRef, useState } from 'react';

// Carpi, la mascota: cualquier página puede hacerla hablar o soltar confeti
const Ctx = createContext({ decir() {}, confeti() {} });
// eslint-disable-next-line react-refresh/only-export-components
export const useCarpi = () => useContext(Ctx);

export function CarpiProvider({ children }) {
    const [msg, setMsg] = useState({ texto: '¡Hola! Soy Carpi.', animo: '', n: 0 });
    const timer = useRef();

    const decir = useCallback((texto, animo = '') => {
        setMsg((m) => ({ texto, animo, n: m.n + 1 }));
        clearTimeout(timer.current);
        if (animo === 'happy') timer.current = setTimeout(() => setMsg((m) => ({ ...m, animo: '' })), 3500);
    }, []);

    const confeti = useCallback(() => {
        const colores = ['#E71873', '#3BA9E8', '#EE6A3A', '#A8D8C4', '#FFD23F'];
        for (let i = 0; i < 46; i++) {
            const d = document.createElement('i');
            d.className = 'cf';
            d.style.cssText = `left:${Math.random() * 100}vw;background:${colores[i % 5]};animation-delay:${Math.random() * 0.5}s;--r:${Math.random() * 720}deg`;
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 2800);
        }
    }, []);

    return (
        <Ctx.Provider value={{ decir, confeti }}>
            {children}
            <div id="mascot" className={msg.animo} aria-live="polite">
                <div className="bub" key={msg.n}>{msg.texto}</div>
                <svg viewBox="0 0 100 90" className="mas" aria-hidden="true">
                    <g className="arm"><rect x="84" y="40" width="9" height="24" rx="4.5" fill="#C0125E" /></g>
                    <path d="M8 22q0-8 8-8h22l8 10h38q8 0 8 8v42q0 8-8 8H16q-8 0-8-8z" fill="#E71873" />
                    <rect x="16" y="30" width="68" height="8" rx="3" fill="#fff" opacity=".9" />
                    <g className="eyes">
                        <ellipse cx="36" cy="57" rx="5" ry="7" fill="#fff" /><circle cx="37" cy="58" r="3" fill="#2B2B33" />
                        <ellipse cx="64" cy="57" rx="5" ry="7" fill="#fff" /><circle cx="65" cy="58" r="3" fill="#2B2B33" />
                    </g>
                    <path className="sm" d="M38 72q12 12 24 0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
            </div>
        </Ctx.Provider>
    );
}