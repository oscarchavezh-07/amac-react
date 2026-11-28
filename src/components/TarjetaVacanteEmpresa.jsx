
export default function TarjetaVacanteEmpresa({
  vacante,
  onCambiarEstado,
  procesando
}) {
  const sueldo = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2
  }).format(vacante.sueldo)

  const numeroSolicitudes = vacante.solicitudes?.[0]?.count ?? 0

  return (
    <article className="vacante-empresa">
      <header className="vacante-empresa-encabezado">
        <div>
          <h2 className="vacante-empresa-titulo"> {vacante.titulo} </h2>
          <span className={`estado-vacante estado-${vacante.estado}`}>
            {vacante.estado === 'activa' ? 'Activa' : vacante.estado === 'pausada' ? 'Pausada' : 'Cerrada'}
          </span>
        </div>
      </header>

      <hr className="separador" />

      <dl className="vacante-empresa-informacion">
        <div className="vacante-empresa-dato">
          <dt>Sueldo</dt>
          <dd>{sueldo} / mes</dd>
        </div>

        <div className="vacante-empresa-dato">
          <dt>Horario</dt>
          <dd>{vacante.horario}</dd>
        </div>

        <div className="vacante-empresa-dato">
          <dt>Categoría</dt>
          <dd>{vacante.categoria}</dd>
        </div>

        <div className="vacante-empresa-dato">
          <dt>Solicitudes recibidas</dt>
          <dd>{numeroSolicitudes}</dd>
        </div>
      </dl>

      <hr className="login-separador-discontinuo" />

      <div className="vacante-empresa-acciones">
        {vacante.estado === 'activa' && (
          <button type="button" className="boton boton-secundario" onClick={() => onCambiarEstado(vacante, 'pausada')} disabled={procesando} >
            Pausar
          </button>
        )}

        {vacante.estado === 'pausada' && (
          <button type="button" className="boton boton-secundario" onClick={() => onCambiarEstado(vacante, 'activa')} disabled={procesando} >
            Reactivar
          </button>
        )}

        {vacante.estado !== 'cerrada' && (
          <button type="button" className="boton boton-cancelar" onClick={() => onCambiarEstado(vacante, 'cerrada')} disabled={procesando} >
            Cerrar Vacante
          </button>
        )}
      </div>
    </article>
  )
}
