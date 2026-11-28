export default function ResumenVacante({ vacante }) {
  const fecha = new Date(vacante.creada_en).toLocaleDateString()

  return (
    <article className="tarjeta-detalle-vacante">

      <header className="encabezado-vacante">
        {/* Extra RF-016: logo de la empresa */}
        {vacante.empresa?.logo_url && (
          <img className="logo-vacante" src={vacante.empresa.logo_url} alt={`Logo de ${vacante.empresa.nombre}`} />
        )}
        <h2>{vacante.titulo}</h2>
      </header>

      <div className="contenido-vacante">

        <div className="descripcion-vacante">
          <p className="empresa">
            <strong>Empresa:</strong>{' '}
            {vacante.empresa?.nombre || 'No especificada'}
          </p>

          <p>
            <strong>Descripción:</strong>
            <br />
            {vacante.descripcion}
          </p>
        </div>
        <hr className="login-separador-discontinuo"/>
        <p />
        <dl className="datos-vacante">

          <div>
            <dt>Sueldo:</dt>
            <dd>
              ${Number(vacante.sueldo).toLocaleString()} / mes
            </dd>
          </div>

          <div>
            <dt>Ubicación:</dt>
            <dd>{vacante.ubicacion}</dd>
          </div>

          <div>
            <dt>Horario:</dt>
            <dd>{vacante.horario}</dd>
          </div>

          <div>
            <dt>Categoría:</dt>
            <dd>{vacante.categoria}</dd>
          </div>

          <div>
            <dt>Estado:</dt>
            <dd>{vacante.estado}</dd>
          </div>

        </dl>
        
        <p className="fecha-publicacion">
          Publicado el <time dateTime={fecha}>{fecha}</time>
        </p>

      </div>
    </article>
  )
}