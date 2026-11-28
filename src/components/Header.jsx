import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from '../lib/supabase';

import logo from "../assets/logo-header0.png";
import iconoAyuda from "../assets/icono-tel-fono0.svg";
import iconoMenu from "../assets/menu0.png";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  async function cerrarSesion() {
    setCargando(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error al cerrar sesión:', error);
        setCargando(false);
        return;
    }

    setMenuAbierto(false);
    // otra vez lo del Auth; el replace evita que atrás redirija inadecuadamente
    navigate('/', { replace: true });
  }

  return (
      <>
          <a className="saltar-contenido" href="#principal"> Saltar al contenido </a>

          <header className="header">
              <div className="barra-superior">
                  <Link to="/" aria-label="Ir al inicio">
                      <img className="logo" src={logo} alt="AMAC" />
                  </Link>
                  <div className="acciones-header">
                      <a className="enlace-ayuda" href="/ayuda">
                          <img className="icono-ayuda" src={iconoAyuda} alt="" aria-hidden="true" />
                          <span>Ayuda</span>
                      </a>
                      <div className="menu-usuario">
                          <button className="boton-menu" type="button" aria-label="Abrir menú de usuario" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)} >
                              <img className="icono-menu" src={iconoMenu} alt="" aria-hidden="true" />
                          </button>

                          {menuAbierto && (
                              <div className="menu-desplegable">
                                  <button type="button" onClick={cerrarSesion} disabled={cargando} >
                                      {cargando ? 'Cerrando sesión...' : 'Cerrar sesión'}
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <nav className="nav" aria-label="Navegación principal" >
                  <NavLink to="/" end className={({ isActive }) => isActive ? 'current-page' : '' } >
                      Vacantes
                  </NavLink>
                  <NavLink to="/mis-solicitudes" className={({ isActive }) => isActive ? 'current-page' : '' } >
                      Solicitudes
                  </NavLink>
                  <NavLink to="/mi-perfil" className={({ isActive }) => isActive ? 'current-page' : '' } >
                      Perfil
                  </NavLink>
              </nav>
          </header>
      </>
    );
}

export default Header;