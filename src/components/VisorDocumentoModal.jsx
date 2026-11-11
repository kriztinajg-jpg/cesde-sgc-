import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatearFecha, formatearTamano, urlArchivo } from '../services/documentosApi';

const ES_IMAGEN = ['png', 'jpg', 'jpeg'];

export default function VisorDocumentoModal({ doc, onClose }) {
    useEffect(() => {
        const alTeclear = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', alTeclear);
        // La página de atrás no se mueve mientras la ventana está abierta
        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', alTeclear);
            document.body.style.overflow = overflowPrevio;
        };
    }, [onClose]);

    const tipo = (doc.tipo || '').toLowerCase();
    const tieneArchivo = !doc.demo;

    return createPortal(
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-visor"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
                {/* Encabezado fijo */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 pb-4 shrink-0">
                    <div className="min-w-0">
            <span className="text-xs bg-slate-100 text-slate-600 font-mono font-bold px-2.5 py-1 rounded-md">
              {doc.codigo}
            </span>
                        <h2 id="titulo-visor" className="text-xl font-bold text-slate-800 mt-2 break-words">{doc.nombre}</h2>
                        {doc.descripcion && <p className="text-sm text-slate-500 mt-1">{doc.descripcion}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        style={{ color: '#475569' }}
                        className="shrink-0 text-xl font-bold w-10 h-10 grid place-items-center rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido con scroll propio */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-100">
                        <div>
                            <p className="font-semibold text-slate-400">Versión</p>
                            <p className="text-sm font-bold text-slate-700">{doc.version}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-400">Actualizado</p>
                            <p className="text-sm font-bold text-slate-700">{formatearFecha(doc.fecha)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-400">Archivo</p>
                            <p className="text-sm font-bold text-slate-700">
                                {tipo ? tipo.toUpperCase() : '—'} · {formatearTamano(doc.tamano)}
                            </p>
                        </div>
                    </div>

                    {!tieneArchivo ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-700">Documento de ejemplo</p>
                            <p className="text-xs text-slate-400 mt-1">No tiene un archivo adjunto. Sube uno para verlo aquí.</p>
                        </div>
                    ) : tipo === 'pdf' ? (
                        <iframe
                            src={urlArchivo(doc.id)}
                            title={`Vista previa de ${doc.nombre}`}
                            className="w-full h-[60vh] rounded-xl border border-slate-200"
                        />
                    ) : ES_IMAGEN.includes(tipo) ? (
                        <img
                            src={urlArchivo(doc.id)}
                            alt={`Vista previa de ${doc.nombre}`}
                            className="max-w-full h-auto mx-auto rounded-xl border border-slate-200"
                        />
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-700">Este tipo de archivo no se puede ver en el navegador</p>
                            <p className="text-xs text-slate-400 mt-1">Descárgalo para abrirlo en Word, Excel o PowerPoint.</p>
                        </div>
                    )}
                </div>

                {/* Botones fijos */}
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 p-4 shrink-0">
                    <button
                        onClick={onClose}
                        style={{ color: '#334155' }}
                        className="px-4 py-2 text-xs font-semibold border border-slate-300 hover:bg-slate-100 rounded-lg transition"
                    >
                        Cerrar
                    </button>
                    {tieneArchivo && (
                        <>
                            <a
                                href={urlArchivo(doc.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:border-[#E71873] hover:text-[#E71873] transition"
                            >
                                Abrir en pestaña nueva
                            </a>
                            <a
                                href={urlArchivo(doc.id, true)}
                                className="px-4 py-2 text-xs font-semibold bg-[#E71873] text-white rounded-lg hover:bg-pink-700 transition shadow-sm"
                            >
                                Descargar archivo
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}