import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '../context/Sesion';

// Deja pasar solo a quien tiene sesión. Con soloAdmin, solo al administrador.
export default function RutaProtegida({ soloAdmin = false }) {
    const { usuario, cargando, esAdministrador } = useSesion();
    const ubicacion = useLocation();

    if (cargando) return <p className="text-center text-slate-500 py-20 animate-pulse">Cargando…</p>;
    if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
    if (soloAdmin && !esAdministrador) return <Navigate to="/" replace />;
    return <Outlet />;
}
