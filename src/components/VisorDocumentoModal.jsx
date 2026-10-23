import { useEffect } from 'react';
import { formatearFecha, formatearTamano, urlArchivo } from '../services/documentosApi';

const ES_IMAGEN = ['png', 'jpg', 'jpeg'];

export default function VisorDocumentoModal({ doc, onClose }) {
    useEffect(() => {
        const alTeclear = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    }, [onClose]);

    const tipo = (doc.tipo || '').toLowerCase();
    const tieneArchivo = !doc.demo;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-visor"
        >
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
            <span className="text-xs bg-slate-100 text-slate-600 font-mono font-bold px-2.5 py-1 rounded-md">
              {doc.codigo}
            </span>
                        <h2 id="titulo-visor" className="text-xl font-bold text-slate-800 mt-2">{doc.nombre}</h2>
                        {doc.descripcion && <p className="text-sm text-slate-500 mt-1">{doc.descripcion}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="text-slate-400 hover:text-slate-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="py-5 space-y-4">
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
                            className="w-full h-[28rem] rounded-xl border border-slate-200"
                        />
                    ) : ES_IMAGEN.includes(tipo) ? (
                        <img
                            src={urlArchivo(doc.id)}
                            alt={`Vista previa de ${doc.nombre}`}
                            className="max-h-[28rem] mx-auto rounded-xl border border-slate-200"
                        />
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-700">Este tipo de archivo no se puede ver en el navegador</p>
                            <p className="text-xs text-slate-400 mt-1">Descárgalo para abrirlo en Word, Excel o PowerPoint.</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        Cerrar
                    </button>
                    {tieneArchivo && (
                        <a
                            href={urlArchivo(doc.id, true)}
                            className="px-4 py-2 text-xs font-semibold bg-[#E71873] text-white rounded-lg hover:bg-pink-700 transition shadow-sm"
                        >
                            Descargar archivo
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}