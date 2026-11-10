// Sesión y administración de usuarios (backend: /api/auth y /api/usuarios).
import { pedir } from './http';

export const ETIQUETA_ROL = { administrador: 'Administrador', consultor: 'Consultor', lector: 'Lector' };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Inicia sesión. Si el correo o la clave no sirven, lanza el error con el mensaje del servidor. */
export async function login(email, clave) {
    await pedir('/api/auth/login', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ email, clave }) }, { avisar401: false });
}

/** Devuelve el usuario conectado ({id, nombre, email, rol, verRestringidos, areas}) o lanza error si no hay sesión. */
export async function me() {
    const res = await pedir('/api/auth/me', {}, { avisar401: false });
    return res.json();
}

export async function logout() {
    await pedir('/api/auth/logout', { method: 'POST' }, { avisar401: false });
}

// ----- Administración de usuarios (solo administrador) -----
export async function listarUsuarios() {
    return (await pedir('/api/usuarios')).json();
}

export async function crearUsuario(datos) {
    return (await pedir('/api/usuarios', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(datos) })).json();
}

export async function actualizarUsuario(id, cambios) {
    return (await pedir(`/api/usuarios/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(cambios) })).json();
}

export async function resetearClave(id, clave) {
    await pedir(`/api/usuarios/${id}/clave`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ clave }) });
}
