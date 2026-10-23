import { useEffect, useRef, useState } from 'react';
import { EXTENSIONES_PERMITIDAS, MAX_MB, formatearTamano, subirDocumento, validarArchivo } from '../services/documentosApi';

const CAMPO =
    'w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E71873] focus:border-transparent transition duration-200';

export default function SubirDocumentoModal({ areaId, categoriaId, categoriaNombre, onClose, onSubido }) {
    const [titulo, setTitulo] = useState('');
    const [version, setVersion] = useState('1.0');
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const inputArchivo = useRef(null);

    // Cerrar con la tecla Esc (salvo mientras se está subiendo)
    useEffect(() => {
        const alTeclear = (e) => {
            if (e.key === 'Escape' && !enviando) onClose();
        };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
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
            });
            onSubido(creado);
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-subir"
        >
            <form onSubmit={enviar} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
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
                        className="text-slate-400 hover:text-slate-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
                    >
                        ✕
                    </button>
                </div>

                <div className="py-5 space-y-4">
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
                                        className="text-xs font-semibold text-[#E71873] hover:underline mt-2"
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
                                        className="mt-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3.5 py-2 rounded-lg hover:border-[#E71873] hover:text-[#E71873] transition"
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

                    {error && (
                        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={enviando}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
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
        </div>
    );
}