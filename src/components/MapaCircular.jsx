import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Colores tomados del mapa estratégico del Genially
const COLORES = {
  estrategico: "#E8317A",
  apoyo: "#3AA9E6",
  control: "#EE6A3A",
  misional: "#334155",
};

// Cada arco del anillo: ángulos en grados (0 = arriba, sentido horario)
const ARCOS = [
  { tipo: "estrategico", inicio: -58, fin: 58 },
  { tipo: "control", inicio: 62, fin: 178 },
  { tipo: "apoyo", inicio: 182, fin: 298 },
];

const punto = (r, grados) => {
  const rad = ((grados - 90) * Math.PI) / 180;
  return [200 + r * Math.cos(rad), 200 + r * Math.sin(rad)];
};

const trazo = (r, inicio, fin) => {
  const [x1, y1] = punto(r, inicio);
  const [x2, y2] = punto(r, fin);
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
};

export default function MapaCircular({ procesos }) {
  const [tipo, setTipo] = useState(null);
  const seleccionado = procesos.find((p) => p.tipo === tipo);

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Mapa circular interactivo */}
      <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto drop-shadow-xl">
        {ARCOS.map((a, i) => (
          <motion.path
            key={a.tipo}
            d={trazo(150, a.inicio, a.fin)}
            fill="none"
            stroke={COLORES[a.tipo]}
            strokeLinecap="round"
            className="cursor-pointer"
            initial={{ pathLength: 0, strokeWidth: 44 }}
            animate={{ pathLength: 1, strokeWidth: tipo === a.tipo ? 58 : 44 }}
            whileHover={{ strokeWidth: 56 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            onClick={() => setTipo(a.tipo)}
          />
        ))}

        {/* Centro: procesos misionales */}
        <motion.g
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          style={{ transformOrigin: "200px 200px" }}
          onClick={() => setTipo("misional")}
        >
          <circle cx="200" cy="200" r="88" fill="white" stroke={COLORES.misional}
                  strokeWidth={tipo === "misional" ? 6 : 2} />
          <text x="200" y="195" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">
            PROCESOS
          </text>
          <text x="200" y="215" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">
            MISIONALES
          </text>
        </motion.g>
      </svg>

      {/* Panel con las áreas del proceso elegido */}
      <div className="min-h-64">
        <AnimatePresence mode="wait">
          {seleccionado ? (
            <motion.div
              key={seleccionado.tipo}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: COLORES[seleccionado.tipo] }}>
                {seleccionado.nombre}
              </h2>
              <div className="grid gap-3">
                {seleccionado.areas.map((area, i) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Link
                      to={`/area/${area.id}`}
                      className="block rounded-xl bg-white px-5 py-4 shadow-md border-l-8 font-semibold hover:shadow-lg transition"
                      style={{ borderColor: COLORES[seleccionado.tipo] }}
                    >
                      {area.nombre}
                      <span className="block text-sm font-normal text-slate-500">Ver documentación →</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.p key="vacio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-slate-500 text-lg text-center md:text-left">
              Toca un proceso del mapa para ver sus áreas.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
