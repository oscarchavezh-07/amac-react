
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';

import Login from './pages/Login';
import ListadoVacantes from './pages/ListadoVacantes';
import DetalleVacante from './pages/DetalleVacante';
import RegistroCandidato from './pages/RegistroCandidato';
import MisSolicitudes from './pages/MisSolicitudes';

// Extras (sección 3.2)
import RecuperarContrasena from './pages/RecuperarContrasena';
import NuevaContrasena from './pages/NuevaContrasena';
import VacantesGuardadas from './pages/VacantesGuardadas';
import LogoEmpresa from './pages/LogoEmpresa';
import PanelAdministrador from './pages/PanelAdministrador';

function Portal() {
    return (
        <>
            <Header />
            <main id="principal" className="main">
                <Routes>
                    <Route path="/" element={<ListadoVacantes />} />
                    <Route path="/vacantes" element={<ListadoVacantes />} />
                    <Route path="/vacante/:id" element={<DetalleVacante />} />
                    <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
                    {/* Extras */}
                    <Route path="/guardadas" element={<RutaProtegida rol="candidato"><VacantesGuardadas /></RutaProtegida>} />
                    <Route path="/empresa/logo" element={<RutaProtegida rol="empresa"><LogoEmpresa /></RutaProtegida>} />
                    <Route path="/admin" element={<RutaProtegida rol="admin"><PanelAdministrador /></RutaProtegida>} />
                    {/*Comodín*/}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

function App() {
    const { sesion } = useAuth();

    return (
        <Routes>
            <Route path="/registro-candidato" element={ sesion ? <Navigate to="/" replace /> : <RegistroCandidato /> } />
            {/* Extra RF-029: recuperar contraseña (antes del comodín) */}
            <Route path="/recuperar" element={ sesion ? <Navigate to="/" replace /> : <RecuperarContrasena /> } />
            <Route path="/nueva-contrasena" element={<NuevaContrasena />} />
            <Route path="*" element={ sesion ? <Portal /> : <Login /> } />
        </Routes>
    );
}

export default App;
