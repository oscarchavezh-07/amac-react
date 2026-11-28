import { Link } from 'react-router-dom'

export default function TarjetaVacante({ vacante }) {
  return (
    <article className="tarjeta-vacante">

      <h2>
        {/* Extra RF-016: logo de la empresa */}
        {vacante.empresa?.logo_url && (
          <img className="logo-vacante" src={vacante.empresa.logo_url} alt="" />
        )}
        {vacante.titulo}
      </h2>

      <div className="detalles-vacante">

        <p className="dato-vacante">
          <strong>Empresa:</strong>{' '}
          {vacante.empresa?.nombre || 'No especificada'}
        </p>

        <p className="dato-vacante">
          <strong>Sueldo:</strong>{' '}
          {vacante.sueldo != null
            ? `$${Number(vacante.sueldo).toLocaleString('es-MX')} / mes`
            : 'No especificado'}
        </p>

        <p className="dato-vacante dato-ubicacion">
          <strong>Ubicación:</strong> {vacante.ubicacion}
        </p>

        <hr />

        <p className="dato-vacante dato-horario">
          <strong>Horario:</strong> {vacante.horario}
        </p>

        <p className="dato-vacante dato-modalidad">
          <strong>Categoría:</strong> {vacante.categoria}
        </p>

        <p className="dato-vacante descripcion-vacante">
          <strong>Descripción:</strong> {vacante.descripcion}
        </p>

        <hr />

        <div className="acciones-vacante">
          <Link
            className="boton boton-secundario"
            to={`/vacante/${vacante.id}`}
          >
            Ver más
          </Link>
        </div>

      </div>
    </article>
  )
}