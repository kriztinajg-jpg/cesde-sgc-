// Procesos, áreas y categorías del SGC. Los ids coinciden con database/seed.sql
export const PROCESOS = [
    { tipo: 'estrategico', nombre: 'Proceso estratégico', color: '#E71873', desc: 'Orienta el rumbo y la planeación institucional.', areas: [1] },
    { tipo: 'misional', nombre: 'Procesos misionales', color: 'var(--mis)', desc: 'Materializa la misión y entrega valor a nuestros usuarios.', areas: [2, 3] },
    { tipo: 'apoyo', nombre: 'Procesos de apoyo', color: '#3BA9E8', desc: 'Provee los recursos necesarios para la operación institucional.', areas: [4, 5, 6, 7, 8] },
    { tipo: 'control', nombre: 'Proceso de control', color: '#EE6A3A', desc: 'Evalúa, verifica y promueve la mejora continua.', areas: [9] },
];
export const AREAS = {
    1: 'Rectoría', 2: 'Dirección Académica', 3: 'Conexión de Negocios', 4: 'Jurídica', 5: 'Talento Cesde',
    6: 'Vicerrectoría Administrativa y Financiera', 7: 'Proyectos y Empleo', 8: 'Comunicaciones', 9: 'Auditoría y Calidad',
};
export const CATEGORIAS = [
    { id: 1, nombre: 'Caracterización', icono: '📋', color: '#E71873' },
    { id: 2, nombre: 'Procedimientos', icono: '🔄', color: '#3BA9E8' },
    { id: 3, nombre: 'Formatos', icono: '🧾', color: '#EE6A3A' },
    { id: 4, nombre: 'Documentos', icono: '📁', color: '#7B4FA3' },
    { id: 5, nombre: 'Riesgos', icono: '⚠️', color: '#E0A100' },
    { id: 6, nombre: 'Indicadores', icono: '📊', color: '#2E9E5B' },
    { id: 7, nombre: 'Planes de mejora', icono: '🌱', color: '#3B82C4' },
];
export const areaInfo = (id) => ({ id, nombre: AREAS[id], proceso: PROCESOS.find((p) => p.areas.includes(id)) });