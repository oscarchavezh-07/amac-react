import { Link, NavLink } from "react-router-dom";

import logo from "../assets/logo-header0.png";
import iconoAyuda from "../assets/icono-tel-fono0.svg";
import iconoMenu from "../assets/menu0.png";

function Header() {
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

            <button className="boton-menu" type="button" aria-label="Abrir menú" >
              <img className="icono-menu" src={iconoMenu} alt="Barra del menú" aria-hidden="true"
              />
            </button>
          </div>

        </div>

        <nav className="nav" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) =>
              isActive ? "current-page" : ""
            } > Vacantes
          </NavLink>

          <NavLink to="/mis-solicitudes" className={({ isActive }) =>
              isActive ? "current-page" : ""
            } > Solicitudes
          </NavLink>

          <NavLink
            to="/mi-perfil" className={({ isActive }) =>
              isActive ? "current-page" : ""
            } > Perfil
          </NavLink>
        </nav>
      </header>
    </>
  );
}

export default Header;