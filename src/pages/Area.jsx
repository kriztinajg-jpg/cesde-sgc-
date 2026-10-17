import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useApi } from "../api";
import { Pagina, Estado } from "../components/ui";

export default function Area() {
  const { areaId } = useParams();
  const procesos = useApi("/api/procesos");
  const categorias = useApi("/api/categorias");

  // Busca el nombre del área dentro de los procesos
  const area = procesos.data?.flatMap((p) => p.areas).find((a) => String(a.id) === areaId);

  return (
    <Pagina>
      <Link to="/" className="text-[#E8317A] font-semibold">← Volver al mapa</Link>
      <h1 className="text-3xl font-extrabold mt-4 mb-8">{area ? area.nombre : "Área"}</h1>
      <Estado loading={procesos.loading || categorias.loading} error={procesos.error || categorias.error} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categorias.data?.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -6, scale: 1.03 }}
          >
            <Link
              to={`/area/${areaId}/categoria/${c.id}`}
              className="block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition font-bold text-lg"
            >
              {c.nombre}
              <span className="block text-sm font-normal text-slate-500 mt-1">Ver documentos →</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </Pagina>
  );
}
