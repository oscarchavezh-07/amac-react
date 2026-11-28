import { Link } from 'react-router-dom'
import { formatearSueldo } from '../lib/catalogos'

const ESTADOS = {
  activa: { texto: 'Activa', clase: 'estado-aceptada' },
  pausada: { texto: 'Pausada', clase: 'estado-proceso' },
  cerrada: { texto: 'Cerrada', clase: 'estado-rechazada' },
}

export default function TarjetaVacanteEmpresa({ vacante, onCambiarEstado }) {
  const estado = ESTADOS[vacante.estado] ?? ESTADOS.activa
  const totalSolicitudes = vacante.solicitudes?.[0]?.count ?? 0
/* Marco: Apoyo herramienta*/
  return (
    <article className="vacante-empresa">
      <header className="vacante-empresa-encabezado">
        <h2 className="vacante-empresa-titulo">
          {vacante.titulo}
          <span className={`solicitud-estado ${estado.clase}`}>
            <span className="solo-lectores">Estado: </span>
            {estado.texto}
          </span>
        </h2>
        <div className="vacante-empresa-acciones-principales">
          <Link className="boton boton-principal" to={`/empresa/solicitudes?vacante=${vacante.id}`}>
            Solicitudes ({totalSolicitudes})
          </Link>
          <Link className="boton-secundario" to={`/vacante/${vacante.id}`}>
            Ver detalles<span className="solo-lectores"> de {vacante.titulo}</span>
          </Link>
        </div>
      </header>

      <hr className="divisor" />

      <dl className="vacante-empresa-informacion">
        <div className="vacante-empresa-dato">
          <dt>Sueldo</dt>
          <dd>{formatearSueldo(vacante.sueldo)}</dd>
        </div>
        <div className="vacante-empresa-dato">
          <dt>Horario</dt>
          <dd>{vacante.horario}</dd>
        </div>
        <div className="vacante-empresa-dato">
          <dt>Categoría</dt>
          <dd>{vacante.categoria}</dd>
        </div>
      </dl>

      <hr className="divisor divisor--punteado" />

      <div className="vacante-empresa-acciones">
        <button
          className="boton-secundario"
          type="button"
          disabled={vacante.estado !== 'activa'}
          onClick={() => onCambiarEstado(vacante, 'pausada')}
        >
          Pausar
        </button>
        <button
          className="boton-secundario"
          type="button"
          disabled={vacante.estado !== 'pausada'}
          onClick={() => onCambiarEstado(vacante, 'activa')}
        >
          Reactivar
        </button>
        <button
          className="boton-cancelar"
          type="button"
          disabled={vacante.estado === 'cerrada'}
          onClick={() => onCambiarEstado(vacante, 'cerrada')}
        >
          Cerrar vacante
        </button>
      </div>
    </article>
  )
}