
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';

import Login from './pages/Login';
import ListadoVacantes from './pages/ListadoVacantes';
import DetalleVacante from './pages/DetalleVacante';
import RegistroCandidato from './pages/RegistroCandidato';


import RegistroEmpresa from './pages/RegistroEmpresa';
import RutaProtegida from './components/RutaProtegida';
import PublicarVacante from './pages/PublicarVacante';
import EmpresaVacantes from './pages/EmpresaVacantes';

function Portal() {
    return (
        <>
            <Header />
            <main id="principal" className="main">
                <Routes>
                    <Route path="/" element={<ListadoVacantes />} />
                    <Route path="/vacantes" element={<ListadoVacantes />} />
                    <Route path="/vacante/:id" element={<DetalleVacante />} />
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
            <Route path="/registro-candidato" element={ sesion ? <Navigate to="/" replace /> : <RegistroCandidato />
         } />
         <Route path="/registro-empresa" element={<RegistroEmpresa />} />
         <Route path="/registro-empresa" element={<RegistroEmpresa />} />
         <Route path="/empresa/publicar" element={<RutaProtegida rol="empresa"><PublicarVacante /></RutaProtegida>} />
         <Route path="/empresa/vacantes" element={<RutaProtegida rol="empresa"><EmpresaVacantes /></RutaProtegida>} />
            <Route path="*" element={ sesion ? <Portal /> : <Login /> } />
        </Routes>
    );
}

export default App;
