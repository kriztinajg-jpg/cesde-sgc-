import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CarpiProvider } from './components/Carpi';
import { Cabecera, PieDePagina } from './components/Marco';
import RutaProtegida from './components/RutaProtegida';
import { SesionProvider } from './context/Sesion';
import Home from './pages/Home';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import VistaCategoria from './pages/VistaCategoria';
import VistaProceso from './pages/VistaProceso';

function App() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    return (
        <SesionProvider>
            <CarpiProvider>
                <Cabecera />
                <main>
                    <Routes>
                        {/* Públicas: la portada (la ciudad) y el login */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />

                        {/* Las áreas y sus documentos exigen sesión */}
                        <Route element={<RutaProtegida />}>
                            <Route path="/proceso/:procesoId" element={<VistaProceso />} />
                            <Route path="/proceso/:procesoId/categoria/:categoriaId" element={<VistaCategoria />} />
                        </Route>

                        {/* Solo el administrador gestiona usuarios */}
                        <Route element={<RutaProtegida soloAdmin />}>
                            <Route path="/usuarios" element={<Usuarios />} />
                        </Route>
                    </Routes>
                </main>
                <PieDePagina />
            </CarpiProvider>
        </SesionProvider>
    );
}

export default App;
