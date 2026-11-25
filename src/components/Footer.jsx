import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-contenido">
        <p className="footer-marca">AMAC</p>
        <hr className="footer-separador" />
        <nav className="footer-enlaces" aria-label="Enlaces del footer">
          <div className="footer-enlaces-columna">
            <Link to="/">Inicio</Link>
          </div>
          <div className="footer-enlaces-columna">
            <h3>Contacto</h3>
            <a href="https://www.google.com/maps/search/?api=1&query=Amatista+107,+San+Pedro+Garza+Garc%C3%ADa,+Nuevo+Le%C3%B3n" target="_blank" rel="noopener noreferrer" > Amatista 107, San Pedro Garza García, N.L. </a>

            <a href="mailto:contacto@somosamac.org"> contacto@somosamac.org </a>
          </div>
        </nav>

        <div className="footer-legal">
          <span>© {new Date().getFullYear()} AMAC</span>
          <Link to="/terminos-de-servicio">
            Términos de servicio
          </Link>
          <Link to="/aviso-de-privacidad">
            Términos de privacidad
          </Link>
        </div>

      </div>
    </footer>
  );
}

export default Footer;