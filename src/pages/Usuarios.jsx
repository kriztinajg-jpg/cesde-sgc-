import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AREAS } from '../data/estructura';
import { ETIQUETA_ROL, actualizarUsuario, crearUsuario, listarUsuarios, resetearClave } from '../services/authApi';

const CAMPO =
    'w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E71873] focus:border-transparent transition duration-200';
const ROLES = ['lector', 'consultor', 'administrador'];
const AYUDA_ROL = {
    lector: 'Solo ve los documentos en pantalla.',
    consultor: 'Ve y descarga documentos.',
    administrador: 'Ve, descarga, sube, edita y gestiona usuarios. Ve todas las áreas.',
};

const textoAreas = (u) => {
    if (u.rol === 'administrador') return 'Todas';
    return u.areas.length ? u.areas.map((id) => AREAS[id] ?? id).join(', ') : 'Ninguna';
};

// Ventana para crear o editar un usuario
function FormularioUsuario({ usuario, onClose, onGuardado }) {
    const editar = Boolean(usuario);
    const [nombre, setNombre] = useState(usuario?.nombre ?? '');
    const [email, setEmail] = useState('');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState(usuario?.rol ?? 'lector');
    const [verRestringidos, setVerRestringidos] = useState(usuario?.verRestringidos ?? false);
    const [activo, setActivo] = useState(usuario?.activo ?? true);
    const [areas, setAreas] = useState(usuario?.areas ?? []);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const alTeclear = (e) => { if (e.key === 'Escape' && !enviando) onClose(); };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    }, [enviando, onClose]);

    const alternarArea = (id) => setAreas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

    async function enviar(e) {
        e.preventDefault();
        setError('');
        if (!nombre.trim()) return setError('Escribe el nombre.');
        if (!editar) {
            if (!email.includes('@')) return setError('Escribe un correo válido.');
            if (clave.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
        }
        setEnviando(true);
        try {
            if (editar) {
                await actualizarUsuario(usuario.id, { nombre: nombre.trim(), rol, verRestringidos, activo, areas });
                onGuardado(`Se guardaron los cambios de ${nombre.trim()}.`);
            } else {
                await crearUsuario({ nombre: nombre.trim(), email: email.trim(), clave, rol, verRestringidos, areas });
                onGuardado(`Se creó la cuenta de ${nombre.trim()}.`);
            }
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="titulo-usuario">
            <form onSubmit={enviar} className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 id="titulo-usuario" className="text-xl font-bold text-slate-800">{editar ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                        {editar && <p className="text-xs text-slate-500 mt-1">{usuario.email}</p>}
                    </div>
                    <button type="button" onClick={onClose} disabled={enviando} aria-label="Cerrar"
                            className="text-slate-400 hover:text-slate-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-40">✕</button>
                </div>

                <div className="py-5 space-y-4">
                    <label className="block text-xs font-semibold text-slate-600">
                        Nombre
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} className={`${CAMPO} mt-1 font-normal`} />
                    </label>

                    {!editar && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block text-xs font-semibold text-slate-600">
                                Correo
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" placeholder="persona@cesde.edu.co" className={`${CAMPO} mt-1 font-normal`} />
                            </label>
                            <label className="block text-xs font-semibold text-slate-600">
                                Contraseña inicial
                                <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={`${CAMPO} mt-1 font-normal`} />
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600">
                            Perfil
                            <select value={rol} onChange={(e) => setRol(e.target.value)} className={`${CAMPO} mt-1 font-normal bg-white`}>
                                {ROLES.map((r) => <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>)}
                            </select>
                        </label>
                        <p className="text-xs text-slate-500 mt-1">{AYUDA_ROL[rol]}</p>
                    </div>

                    <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={verRestringidos} onChange={(e) => setVerRestringidos(e.target.checked)} className="mt-1 accent-[#E71873]" />
                        <span>
                            <b>Puede ver documentos restringidos</b>
                            <span className="block text-xs text-slate-500">Para cargos directivos (por ejemplo, "Revisión por la dirección").</span>
                        </span>
                    </label>

                    {editar && (
                        <label className="flex items-start gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="mt-1 accent-[#E71873]" />
                            <span>
                                <b>Cuenta activa</b>
                                <span className="block text-xs text-slate-500">Si la desactivas, la persona ya no puede entrar. No se borra nada.</span>
                            </span>
                        </label>
                    )}

                    <fieldset>
                        <legend className="text-xs font-semibold text-slate-600 mb-1">Áreas que puede ver</legend>
                        {rol === 'administrador' ? (
                            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">El administrador ve todas las áreas.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                {Object.entries(AREAS).map(([id, n]) => (
                                    <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={areas.includes(Number(id))} onChange={() => alternarArea(Number(id))} className="accent-[#E71873]" />
                                        {n}
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>

                    {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={onClose} disabled={enviando} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40">Cancelar</button>
                    <button type="submit" disabled={enviando} className="px-4 py-2 text-xs font-semibold bg-[#E71873] text-white rounded-lg hover:bg-pink-700 transition shadow-sm disabled:opacity-60">
                        {enviando ? 'Guardando…' : editar ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Ventana para que el administrador defina una contraseña nueva
function ClaveModal({ usuario, onClose, onGuardado }) {
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const alTeclear = (e) => { if (e.key === 'Escape' && !enviando) onClose(); };
        window.addEventListener('keydown', alTeclear);
        return () => window.removeEventListener('keydown', alTeclear);
    }, [enviando, onClose]);

    async function enviar(e) {
        e.preventDefault();
        if (clave.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
        setEnviando(true);
        setError('');
        try {
            await resetearClave(usuario.id, clave);
            onGuardado(`Se cambió la contraseña de ${usuario.nombre}.`);
        } catch (err) {
            setError(err.message);
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="titulo-clave">
            <form onSubmit={enviar} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                <h2 id="titulo-clave" className="text-xl font-bold text-slate-800">Nueva contraseña</h2>
                <p className="text-xs text-slate-500 mt-1">Para {usuario.nombre} ({usuario.email}). La contraseña anterior deja de servir de inmediato.</p>
                <label className="block text-xs font-semibold text-slate-600 mt-5">
                    Contraseña nueva
                    <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={`${CAMPO} mt-1 font-normal`} />
                </label>
                {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mt-4">{error}</p>}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-5">
                    <button type="button" onClick={onClose} disabled={enviando} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40">Cancelar</button>
                    <button type="submit" disabled={enviando} className="px-4 py-2 text-xs font-semibold bg-[#E71873] text-white rounded-lg hover:bg-pink-700 transition shadow-sm disabled:opacity-60">
                        {enviando ? 'Guardando…' : 'Cambiar contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Usuarios() {
    const [lista, setLista] = useState(null);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [formulario, setFormulario] = useState(null); // null | { usuario?: {...} }
    const [claveDe, setClaveDe] = useState(null);

    const cargar = useCallback(() => {
        listarUsuarios()
            .then((l) => { setLista(l); setError(''); })
            .catch((e) => { setLista([]); setError(e.message); });
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    function guardado(mensaje) {
        setFormulario(null);
        setClaveDe(null);
        setAviso(mensaje);
        cargar();
    }

    return (
        <>
            <div className="ahead">
                <Link to="/" className="back">← Volver a la ciudad</Link><br />
                <span className="tag">Administración</span>
                <h1>Usuarios</h1>
                <p>Crea cuentas, define el perfil de cada persona y las áreas que puede ver.</p>
            </div>

            <div className="bar">
                <span style={{ flex: 1 }} />
                <button className="btn" onClick={() => { setAviso(''); setFormulario({}); }}>+ Nuevo usuario</button>
            </div>
            {aviso && <p role="status" className="okm">{aviso}</p>}
            {error && <p role="alert" className="err">{error}</p>}

            {lista === null ? <div className="emp"><p>Cargando usuarios…</p></div> : (
                <div className="tbl"><table>
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Perfil</th><th>Áreas</th><th>Restringidos</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>{lista.map((u) => (
                        <tr key={u.id}>
                            <td>{u.nombre}</td>
                            <td>{u.email}</td>
                            <td><span className="ty">{(ETIQUETA_ROL[u.rol] ?? u.rol).toUpperCase()}</span></td>
                            <td>{textoAreas(u)}</td>
                            <td>{u.rol === 'administrador' || u.verRestringidos ? 'Sí' : 'No'}</td>
                            <td>
                                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {u.activo ? 'Activa' : 'Desactivada'}
                                </span>
                            </td>
                            <td>
                                <button className="btn" onClick={() => { setAviso(''); setFormulario({ usuario: u }); }}>Editar</button>{' '}
                                <button className="btn o" onClick={() => { setAviso(''); setClaveDe(u); }}>Contraseña</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table></div>
            )}

            {formulario && <FormularioUsuario usuario={formulario.usuario} onClose={() => setFormulario(null)} onGuardado={guardado} />}
            {claveDe && <ClaveModal usuario={claveDe} onClose={() => setClaveDe(null)} onGuardado={guardado} />}
        </>
    );
}
