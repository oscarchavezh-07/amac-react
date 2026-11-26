import { Link } from 'react-router-dom'

export default function AccionesVacante({
  vacante,
  yaPostulado,
  onPostular
}) {
  return (
    <div className="acciones-vacante">

      <button className="boton boton-principal" type="button" onClick={onPostular} disabled={yaPostulado || vacante.estado !== 'activa'} >
        {yaPostulado
          ? 'Ya te postulaste'
          : vacante.estado !== 'activa'
            ? 'Vacante no disponible'
            : 'Postularme'}
      </button>

      <Link className="boton boton-secundario" to="/vacantes">
        Regresar
      </Link>

    </div>
  )
}