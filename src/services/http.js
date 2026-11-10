// Pedidos al backend: siempre con la cookie de sesión y con mensajes de error claros.

async function leerError(res) {
    try {
        const cuerpo = await res.json();
        if (cuerpo?.message) return cuerpo.message;
    } catch {
        // la respuesta no era JSON
    }
    if (res.status === 413) return 'El archivo supera el tamaño máximo permitido (20 MB).';
    if (res.status === 403) return 'No tienes permiso para hacer esto.';
    if (res.status === 401) return 'Inicia sesión para continuar.';
    return `El servidor respondió con un error (${res.status}).`;
}

/**
 * Hace el pedido. Si el backend responde 401 (sesión vencida o inexistente),
 * avisa a toda la app para que lleve al login (salvo que se pida lo contrario).
 */
export async function pedir(url, opciones = {}, { avisar401 = true } = {}) {
    let res;
    try {
        res = await fetch(url, { credentials: 'include', ...opciones });
    } catch {
        throw new Error('No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
    }
    if (res.status === 401 && avisar401) window.dispatchEvent(new Event('sesion-vencida'));
    if (!res.ok) {
        const error = new Error(await leerError(res));
        error.status = res.status;
        throw error;
    }
    return res;
}
