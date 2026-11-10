import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/Sesion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const ubicacion = useLocation();
    const { usuario, cargando: cargandoSesion, iniciarSesion } = useSesion();
    const destino = ubicacion.state?.desde || '/';

    // Si ya hay sesión, no tiene sentido ver el login
    if (!cargandoSesion && usuario) return <Navigate to={destino} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            await iniciarSesion(email.trim(), clave);
            navigate(destino, { replace: true });
        } catch (err) {
            setError(err.message);
            setClave('');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-7xl bg-[#0e131f] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[680px]">

                {/* Panel Izquierdo */}
                <div className="md:col-span-6 bg-gradient-to-br from-[#db2777] via-[#9d174d] to-[#4c0519] p-12 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-8 border border-white/20 shadow-sm">
                            Plataforma SGC · Ciudad CESDE
                        </span>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6">
                            Sistema de Gestión Documental
                        </h1>
                        <p className="text-base text-pink-100/90 leading-relaxed max-w-xl">
                            Plataforma institucional centralizada para el acceso, control de procesos y trazabilidad de la calidad académica y administrativa.
                        </p>
                    </div>

                    <div className="relative z-10 mt-16">
                        <div className="p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
                            <p className="font-bold text-pink-50 text-sm mb-1.5 flex items-center gap-2">
                                <span>🔐</span> Acceso según tu perfil
                            </p>
                            <p className="text-xs text-pink-200/80 leading-relaxed">
                                Tu perfil (Administrador, Consultor o Lector) y las áreas que te asignaron definen lo que puedes ver y hacer en la plataforma.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="md:col-span-6 p-10 md:p-16 flex flex-col justify-center bg-[#090d16]">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-white tracking-wide">
                            Iniciar Sesión
                        </h2>
                        <p className="text-sm text-slate-400 mt-2">
                            Ingresa tus credenciales institucionales para habilitar tu sesión.
                        </p>
                    </div>

                    {error && (
                        <div role="alert" className="mb-6 p-4 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-sm font-medium text-center shadow-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                                Correo Electrónico Institucional
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@cesde.edu.co"
                                className="w-full px-5 py-3.5 bg-[#141a29] border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#db2777] transition-colors shadow-inner"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-clave" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                                Contraseña
                            </label>
                            <input
                                id="login-clave"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-[#141a29] border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#db2777] transition-colors shadow-inner"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full py-4 px-6 bg-[#db2777] hover:bg-[#be185d] text-white font-bold rounded-xl text-sm tracking-wide transition-all duration-200 shadow-xl shadow-pink-950/50 mt-4 disabled:opacity-50"
                        >
                            {cargando ? 'Autenticando...' : 'Ingresar a la Plataforma'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
