import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useApi } from "../api";
import { Pagina, Estado } from "../components/ui";

export default function Documentos() {
  const { areaId, categoriaId } = useParams();
  const documentos = useApi(`/api/areas/${areaId}/documentos?categoriaId=${categoriaId}`);
  const categorias = useApi("/api/categorias");
  const categoria = categorias.data?.find((c) => String(c.id) === categoriaId);

  return (
    <Pagina>
      <Link to={`/area/${areaId}`} className="text-[#E8317A] font-semibold">← Volver a las categorías</Link>
      <h1 className="text-3xl font-extrabold mt-4 mb-8">{categoria ? categoria.nombre : "Documentos"}</h1>
      <Estado loading={documentos.loading} error={documentos.error} />

      {documentos.data?.length === 0 && (
        <p className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow">
          Aún no hay documentos en esta categoría.
        </p>
      )}

      <div className="grid gap-4">
        {documentos.data?.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl bg-white p-5 shadow-md flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold">{d.titulo}</p>
              <p className="text-sm text-slate-500">Versión {d.version} · {d.tipoArchivo}</p>
            </div>
            <a href={d.archivoUrl} className="rounded-lg bg-[#E8317A] px-4 py-2 text-white font-semibold">
              Descargar
            </a>
          </motion.div>
        ))}
      </div>
    </Pagina>
  );
}
