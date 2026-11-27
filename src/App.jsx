
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';

import Login from './pages/Login';
import ListadoVacantes from './pages/ListadoVacantes';
import DetalleVacante from './pages/DetalleVacante';
import RegistroCandidato from './pages/RegistroCandidato';
import MisSolicitudes from './pages/MisSolicitudes';

import RegistroEmpresa from './pages/RegistroEmpresa'
import VacantesEmpresa from './pages/VacantesEmpresa';
import CrearVacante from './pages/CrearVacante'

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
                    {/*Comodín*/}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

function PortalEmpresa() {
  return (
    <>
      <Header />
      <div id="principal" className="main">
        <Routes>
          <Route path="/" element={<VacantesEmpresa />} />
          <Route path="/vacantes-empresa" element={<VacantesEmpresa />} />
          <Route path="/crear-vacante" element={<CrearVacante />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </>
  )
}

export default function App() {
  const { sesion, perfil } = useAuth()

  // public
  if (!sesion) {
    return (
      <Routes>
        <Route path="/registro-candidato" element={<RegistroCandidato />} />
        <Route path="/registro-empresa" element={<RegistroEmpresa />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  // si por alguna extraña razón no hay perfil
  if (!perfil) {
    return (
      <main>
        <p> Cargando tu portal... si tarda mucho probablemente algo no se encontró tu perfil </p>
      </main>
    )
  }

  // roles (candidato y empresa, más tarde admin)
  if (perfil.rol === 'candidato') {
    return <Portal />
  }

  if (perfil.rol === 'empresa') {
    return <PortalEmpresa />
  }

  // basicamente si por alguna razón se olvida poner un portal para tal rol
  return (
    <main>
      <p role="alert"> Cómo obtuvo su cuenta de nuevo? </p>
    </main>
  )
}
