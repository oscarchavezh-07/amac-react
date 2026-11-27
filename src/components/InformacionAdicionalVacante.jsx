export default function InformacionAdicionalVacante({ vacante }) {
  return (
    <section className="panel-informacion-vacante">

      <div className="">

        <section className="bloque-informacion">
          <h2>Requisitos</h2>
          <p>{vacante.requisitos}</p>
        </section>
        <hr className="login-separador-discontinuo"/>
        <section className="bloque-informacion">
          <h2>Prestaciones</h2>
          <p>{vacante.prestaciones}</p>
        </section>

      </div>

      {vacante.telefono_contacto && (
        <a
          className="boton boton-secundario boton-llamar"
          href={`tel:${vacante.telefono_contacto}`}
        >
          Llamar a la empresa
        </a>
      )}

    </section>
  )
}