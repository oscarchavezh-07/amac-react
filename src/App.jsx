
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
import SolicitudesRecibidas from './pages/SolicitudesRecibidas'

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
                    {/* Extra RF-041 */}
                    <Route path="/guardadas" element={<VacantesGuardadas />} />
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
          <Route path="/solicitudes-recibidas" element={<SolicitudesRecibidas />} />
          {/* Extra RF-016 */}
          <Route path="/empresa/logo" element={<LogoEmpresa />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </>
  )
}

// Extra RF-054: portal del administrador de AMAC
function PortalAdmin() {
  return (
    <>
      <Header />
      <main id="principal" className="main">
        <Routes>
          <Route path="/" element={<PanelAdministrador />} />
          <Route path="/admin" element={<PanelAdministrador />} />
          <Route path="/vacantes" element={<ListadoVacantes />} />
          <Route path="/vacante/:id" element={<DetalleVacante />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

// Elige el portal según el rol del perfil
function PortalSegunRol() {
  const { perfil } = useAuth()

  // si por alguna extraña razón no hay perfil
  if (!perfil) {
    return (
      <main>
        <p> Cargando tu portal... si tarda mucho probablemente algo no se encontró tu perfil </p>
      </main>
    )
  }

  if (perfil.rol === 'candidato') return <Portal />
  if (perfil.rol === 'empresa') return <PortalEmpresa />
  if (perfil.rol === 'admin') return <PortalAdmin />

  // basicamente si por alguna razón se olvida poner un portal para tal rol
  return (
    <main>
      <p role="alert"> Cómo obtuvo su cuenta de nuevo? </p>
    </main>
  )
}

export default function App() {
  const { sesion } = useAuth()

  // public
  if (!sesion) {
    return (
      <Routes>
        <Route path="/registro-candidato" element={<RegistroCandidato />} />
        <Route path="/registro-empresa" element={<RegistroEmpresa />} />
        {/* Extra RF-029: recuperar contraseña */}
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/nueva-contrasena" element={<NuevaContrasena />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* El enlace del correo inicia sesión, así que va antes de los portales */}
      <Route path="/nueva-contrasena" element={<NuevaContrasena />} />
      <Route path="*" element={<PortalSegunRol />} />
    </Routes>
  )
}
