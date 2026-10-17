import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Area from "./pages/Area";
import Documentos from "./pages/Documentos";

export default function App() {
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-[#E8317A]">
            CESDE <span className="font-medium text-slate-500">· Sistema de Gestión de Calidad</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/area/:areaId" element={<Area />} />
          <Route path="/area/:areaId/categoria/:categoriaId" element={<Documentos />} />
        </Routes>
      </main>
    </>
  );
}
