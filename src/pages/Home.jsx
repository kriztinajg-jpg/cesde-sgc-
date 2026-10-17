import { useApi } from "../api";
import { Pagina, Estado } from "../components/ui";
import MapaCircular from "../components/MapaCircular";

export default function Home() {
  const { data: procesos, loading, error } = useApi("/api/procesos");

  return (
    <Pagina>
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-[#E8317A] mb-2">
        Mapa estratégico de procesos
      </h1>
      <p className="text-center text-slate-600 mb-10">
        Explora la documentación del Sistema de Gestión de Calidad del CESDE.
      </p>
      <Estado loading={loading} error={error} />
      {procesos && <MapaCircular procesos={procesos} />}
    </Pagina>
  );
}
