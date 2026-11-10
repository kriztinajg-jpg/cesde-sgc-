// Comunicación con la API de documentos del backend (sgc-api).
import { pedir } from './http';

const BASE = '/api/documentos';

export const MAX_MB = 20;
export const EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg'];

export async function listarDocumentos({ areaId, categoriaId, q } = {}) {
    const params = new URLSearchParams();
    if (areaId != null) params.set('areaId', areaId);
    if (categoriaId != null) params.set('categoriaId', categoriaId);
    if (q) params.set('q', q);
    const res = await pedir(`${BASE}?${params}`);
    return res.json();
}

export async function subirDocumento({ archivo, areaId, categoriaId, titulo, descripcion, version, restringido = false }) {
    const datos = new FormData();
    datos.append('archivo', archivo);
    datos.append('areaId', areaId);
    datos.append('categoriaId', categoriaId);
    datos.append('titulo', titulo);
    if (descripcion) datos.append('descripcion', descripcion);
    if (version) datos.append('version', version);
    datos.append('restringido', restringido ? 'true' : 'false');
    const res = await pedir(BASE, { method: 'POST', body: datos });
    return res.json();
}

/** Dirección del archivo: para verlo en el navegador o para descargarlo. */
export const urlArchivo = (id, descargar = false) =>
    `${BASE}/${id}/archivo${descargar ? '?descargar=true' : ''}`;

/** Devuelve un mensaje de error si el archivo no sirve, o null si está bien. */
export function validarArchivo(archivo) {
    if (!archivo) return 'Selecciona un archivo para subir.';
    const ext = archivo.name.split('.').pop().toLowerCase();
    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
        return `Tipo de archivo no permitido. Usa: ${EXTENSIONES_PERMITIDAS.join(', ')}.`;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
        return `El archivo pesa ${formatearTamano(archivo.size)} y el máximo es ${MAX_MB} MB.`;
    }
    return null;
}

export function formatearTamano(bytes) {
    if (bytes == null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatearFecha(iso) {
    if (!iso) return '—';
    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleDateString('es-CO');
}