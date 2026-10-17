import { motion } from "framer-motion";

// Envuelve cada página con una transición suave de entrada
export function Pagina({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

// Muestra "cargando" o el error si el backend no responde
export function Estado({ loading, error }) {
  if (loading) {
    return <p className="text-center text-slate-500 py-20 animate-pulse">Cargando información…</p>;
  }
  if (error) {
    return (
      <p className="text-center text-red-600 py-20">
        No se pudo conectar con el servidor. ¿Está encendido el backend?
      </p>
    );
  }
  return null;
}
