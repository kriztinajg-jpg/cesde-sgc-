import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EXTENSIONES_PERMITIDAS, MAX_MB, formatearTamano, subirDocumento, validarArchivo } from '../services/documentosApi';

const CAMPO =
    'w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E71873] focus:border-transparent transition duration-200';

export default function SubirDocumentoModal({ areaId, categoriaId, categoriaNombre, onClose, onSubido }) {
    const [titulo, setTitulo] = useState('');
    const [version, setVersion] = useState('1.0');
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [restringido, setRestringido] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const inputArchivo = useRef(null);

    // Cerrar con Esc (salvo mientras se sube) y bloquear el scroll de la página de atrás
    useEffect(() => {
        const alTeclear = (e) => {
            if (e.key === 'Escape' && !enviando) onClose();
        };
        window.addEventListener('keydown', alTeclear);
        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', alTeclear);
            document.body.style.overflow = overflowPrevio;
        };
    }, [enviando, onClose]);

    function elegirArchivo(nuevo) {
        const problema = nuevo ? validarArchivo(nuevo) : null;
        setError(problema ?? '');
        setArchivo(problema ? null : nuevo);
        // Si el título está vacío, proponer el nombre del archivo sin extensión
        if (!problema && nuevo && !titulo.trim()) setTitulo(nuevo.name.replace(/\.[^.]+$/, ''));
    }

    async function enviar(e) {
        e.preventDefault();
        if (!titulo.trim()) return setError('Escribe un título para el documento.');
        const problema = validarArchivo(archivo);
        if (problema) return setError(problema);

        setEnviando(true);
        setError('');
        try {
            const creado = await subirDocumento({
                archivo,
                areaId,
                categoriaId,
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                version: version.trim() || '1.0',
                restringido,
            });
            onSubido(creado);
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-subir"
            onClick={(e) => { if (e.target === e.currentTarget && !enviando) onClose(); }}
        >
            <form
                onSubmit={enviar}
                className="modal-claro bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100"
            >
                {/* Encabezado fijo */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 pb-4 shrink-0">
                    <div>
                        <h2 id="titulo-subir" className="text-xl font-bold text-slate-800">Subir documento</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Categoría: <span className="font-semibold text-slate-700">{categoriaNombre}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={enviando}
                        aria-label="Cerrar"
                        style={{ color: '#475569' }}
                        className="shrink-0 text-xl font-bold w-10 h-10 grid place-items-center rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-40"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido con scroll propio */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Zona para soltar o elegir el archivo */}
                    <div>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">Archivo</span>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                            onDragLeave={() => setArrastrando(false)}
                            onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegirArchivo(e.dataTransfer.files[0]); }}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                                arrastrando ? 'border-[#E71873] bg-pink-50' : 'border-slate-300 bg-slate-50/50'
                            }`}
                        >
                            {archivo ? (
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-800 break-all">{archivo.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{formatearTamano(archivo.size)}</p>
                                    <button
                                        type="button"
                                        onClick={() => { setArchivo(null); if (inputArchivo.current) inputArchivo.current.value = ''; }}
                                        style={{ color: '#E71873' }}
                                        className="text-xs font-semibold hover:underline mt-2"
                                    >
                                        Quitar archivo
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-700">Arrastra el archivo aquí o</p>
                                    <button
                                        type="button"
                                        onClick={() => inputArchivo.current?.click()}
                                        style={{ color: '#334155' }}
                                        className="mt-2 text-xs font-semibold bg-white border border-slate-300 px-3.5 py-2 rounded-lg hover:border-[#E71873] transition"
                                    >
                                        Elegir archivo
                                    </button>
                                    <p className="text-xs text-slate-400 mt-3">
                                        {EXTENSIONES_PERMITIDAS.join(', ')} · máximo {MAX_MB} MB
                                    </p>
                                </>
                            )}
                            <input
                                ref={inputArchivo}
                                type="file"
                                accept={EXTENSIONES_PERMITIDAS.map((x) => `.${x}`).join(',')}
                                onChange={(e) => elegirArchivo(e.target.files[0])}
                                className="sr-only"
                                aria-label="Archivo del documento"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <label className="col-span-2 block text-xs font-semibold text-slate-600">
                            Título
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                maxLength={200}
                                placeholder="Ej: Procedimiento de auditoría interna"
                                className={`${CAMPO} mt-1 font-normal`}
                            />
                        </label>
                        <label className="block text-xs font-semibold text-slate-600">
                            Versión
                            <input
                                type="text"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                maxLength={20}
                                className={`${CAMPO} mt-1 font-normal`}
                            />
                        </label>
                    </div>

                    <label className="block text-xs font-semibold text-slate-600">
                        Descripción <span className="font-normal text-slate-400">(opcional)</span>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className={`${CAMPO} mt-1 font-normal resize-none`}
                        />
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={restringido}
                            onChange={(e) => setRestringido(e.target.checked)}
                            className="mt-1 h-4 w-4 accent-[#E71873]"
                        />
                        <span className="text-xs text-slate-700">
                            <b>🔒 Documento restringido</b>
                            <span className="block text-slate-500 mt-0.5">
                                Solo lo verán los administradores y las personas con permiso para ver restringidos.
                            </span>
                        </span>
                    </label>

                    {error && (
                        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* Botones fijos */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={enviando}
                        style={{ color: '#334155' }}
                        className="px-4 py-2 text-xs font-semibold border border-slate-300 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={enviando}
                        className="px-4 py-2 text-xs font-semibold bg-[#E71873] text-white rounded-lg hover:bg-pink-700 transition shadow-sm disabled:opacity-60"
                    >
                        {enviando ? 'Subiendo…' : 'Subir documento'}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
}