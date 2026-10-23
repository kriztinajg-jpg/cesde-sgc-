import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CarpiProvider } from './components/Carpi';
import { Cabecera, PieDePagina } from './components/Marco';
import Home from './pages/Home';
import VistaCategoria from './pages/VistaCategoria';
import VistaProceso from './pages/VistaProceso';

function App() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    return (
        <CarpiProvider>
            <Cabecera />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/proceso/:procesoId" element={<VistaProceso />} />
                    <Route path="/proceso/:procesoId/categoria/:categoriaId" element={<VistaCategoria />} />
                </Routes>
            </main>
            <PieDePagina />
        </CarpiProvider>
    );
}

export default App;