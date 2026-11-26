import { Link } from 'react-router-dom'

export default function ConfirmacionPostulacion({
  tipo,
  mensaje,
  cargando,
  onConfirmar,
  onCerrar
}) {
  return (
    <div className="modal-postulacion">

      <section className="contenido-modal-postulacion" role="dialog" aria-modal="true" aria-labelledby="titulo-modal" >
        {tipo === 'confirmacion' && (
          <>
            <h2 id="titulo-modal">Confirmar postulación</h2>

            <p>
              ¿Estás seguro de que deseas postularte a esta vacante?
            </p>

            <p>
              Una vez enviada, tu solicitud quedará registrada en la
              plataforma.
            </p>

            <div className="acciones-modal">
              <button className="boton boton-principal" onClick={onConfirmar} disabled={cargando} >
                {cargando ? 'Enviando...' : 'Confirmar'}
              </button>

              <button className="boton boton-secundario" onClick={onCerrar} disabled={cargando} >
                Cancelar
              </button>
            </div>
          </>
        )}

        {tipo === 'exito' && (
          <>
            <h2 id="titulo-modal">¡Postulación enviada!</h2>

            <p>{mensaje}</p>

            <button className="boton boton-principal" onClick={onCerrar} >
              Aceptar
            </button>
          </>
        )}

        {tipo === 'error' && (
          <>
            <h2 id="titulo-modal">No fue posible postularse</h2>

            <p>{mensaje}</p>

            <div className="acciones-modal">
              <button className="boton boton-secundario" onClick={onCerrar} >
                Cerrar
              </button>

              <Link className="boton boton-principal" to="/" >
                Volver al listado
              </Link>
            </div>
          </>
        )}

      </section>
    </div>
  )
}