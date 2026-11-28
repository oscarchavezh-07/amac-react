
import { Link } from 'react-router-dom'
import ProgresoEtapas from './ProgresoEtapas'

const clasesEstatus = {
  'Enviada': 'estado-enviada',
  'En revisión': 'estado-proceso',
  'Aceptada': 'estado-aceptada',
  'Rechazada': 'estado-rechazada',
  'Cancelada': 'estado-cancelada'
}

export default function TarjetaSolicitud({solicitud,onCancelar,cancelando}) {
  const vacante = solicitud.vacante
  const empresa = vacante?.empresa
  
  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible'
    return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
    }).format(new Date(fecha))
}

  const puedeCancelar = [
    'Enviada',
    'En revisión'
  ].includes(solicitud.estatus)

  return (
    <article className="mi-solicitud-tarjeta">

      <div className="mi-solicitud-tarjeta-encabezado">
        <h2 className="solicitud-puesto">
          {vacante?.titulo || 'Vacante no disponible'}
        </h2>
      </div>

      <div className="mi-solicitud-tarjeta-contenido">
        <div className="solicitud-empresa-estado">
          <h3 className="solicitud-empresa"> {empresa?.nombre || 'Empresa no disponible'}
          </h3>
          <span className={`solicitud-estado ${ clasesEstatus[solicitud.estatus] || ''
          }`}>
            {solicitud.estatus}
          </span>

        </div>

        <p> Postulado el{' '} <time dateTime={solicitud.creada_en}> {formatearFecha(solicitud.creada_en)} </time> </p>

        {/* Extra RF-024: cuándo cambió el estatus por última vez */}
        {solicitud.estatus_actualizado_en && (
          <p> Estatus actualizado el{' '} <time dateTime={solicitud.estatus_actualizado_en}> {formatearFecha(solicitud.estatus_actualizado_en)} </time> </p>
        )}

        {/* Extra RF-055: etapas del proceso de selección */}
        <ProgresoEtapas estatus={solicitud.estatus} etapa={solicitud.etapa} />

        <hr className="divisor-filtros" />
        <p> {vacante?.ubicacion || 'Ubicación no disponible'} </p>
        <p> Horario: {vacante?.horario || 'No especificado'} </p>

        <div className="solicitud-botones">
          <button className="boton-cancelar" type="button" disabled={!puedeCancelar || cancelando} onClick={() => onCancelar(solicitud)} >
            {cancelando ? 'Cancelando...' : 'Cancelar'}
          </button>

          {vacante?.id && (
            <Link to={`/vacante/${vacante.id}`} className="boton-secundario" >
              Ver más
            </Link>
          )}

        </div>
      </div>
    </article>
  )
}
