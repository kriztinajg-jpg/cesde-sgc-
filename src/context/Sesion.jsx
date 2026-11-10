import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/authApi';

const Contexto = createContext(null);

// Guarda quién es el usuario conectado y qué puede hacer. La verdad la tiene el backend:
// aquí solo se usa para mostrar u ocultar botones y pantallas.
export function SesionProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al abrir la app, preguntar al backend si ya hay una sesión
    useEffect(() => {
        let activo = true;
        authApi.me()
            .then((u) => { if (activo) setUsuario(u); })
            .catch(() => { if (activo) setUsuario(null); })
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    // Si cualquier pedido recibe 401, la sesión se venció: volver al login
    useEffect(() => {
        const vencida = () => setUsuario(null);
        window.addEventListener('sesion-vencida', vencida);
        return () => window.removeEventListener('sesion-vencida', vencida);
    }, []);

    const iniciarSesion = useCallback(async (email, clave) => {
        await authApi.login(email, clave);
        const u = await authApi.me();
        setUsuario(u);
        return u;
    }, []);

    const cerrarSesion = useCallback(async () => {
        try { await authApi.logout(); } catch { /* aunque falle, se limpia la sesión local */ }
        setUsuario(null);
    }, []);

    const valor = useMemo(() => {
        const admin = usuario?.rol === 'administrador';
        return {
            usuario,
            cargando,
            iniciarSesion,
            cerrarSesion,
            esAdministrador: admin,
            puedeDescargar: Boolean(usuario) && usuario.rol !== 'lector',
            puedeVerArea: (areaId) => Boolean(usuario) && (admin || (usuario.areas || []).includes(areaId)),
        };
    }, [usuario, cargando, iniciarSesion, cerrarSesion]);

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion() {
    const c = useContext(Contexto);
    if (!c) throw new Error('useSesion debe usarse dentro de SesionProvider');
    return c;
}
