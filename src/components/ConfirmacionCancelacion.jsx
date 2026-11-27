export default function ConfirmacionCancelacion({
  solicitud,
  cargando,
  onConfirmar,
  onCerrar
}) {
  if (!solicitud) return null

  return (
    <div className="modal-postulacion">

      <section className="contenido-modal-postulacion" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion" >
        <h2 id="titulo-confirmacion"> Cancelar solicitud </h2>
        <p> ¿Estás seguro de que deseas cancelar tu solicitud para <strong>{solicitud.vacante?.titulo}</strong>? </p>
        <p> Esta acción cambiará el estatus de tu solicitud a Cancelada. </p>

        <div className="acciones-modal">
          <button type="button" className="boton boton-principal" onClick={onCerrar} disabled={cargando} >
            Volver
          </button>
          <button type="button" className="boton boton-secundario" onClick={onConfirmar} disabled={cargando} >
            {cargando ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </section>
    </div>
  )
}