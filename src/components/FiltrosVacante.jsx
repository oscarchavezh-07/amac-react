export default function FiltrosVacantes({
  horarios,
  setHorarios,
  categorias,
  setCategorias
}) {
  function actualizarFiltro(valor, seleccionados, setSeleccionados) {
    if (seleccionados.includes(valor)) {
      setSeleccionados(seleccionados.filter(item => item !== valor))
    } else {
      setSeleccionados([...seleccionados, valor])
    }
  }

  return (
    <aside className="filtros">
      <form className="panel-filtros" onSubmit={e => e.preventDefault()}>

        <h2 id="titulo-filtros">Filtros</h2>

        <div className="grupo-filtros">

          <fieldset>
            <legend>Horarios</legend>

            {[
              { valor: 'Matutino', texto: 'Matutino' },
              { valor: 'Vespertino', texto: 'Vespertino' },
              { valor: 'Medio tiempo', texto: 'Medio tiempo' },
              { valor: 'Fines de semana', texto: 'Fines de semana' }
            ].map(opcion => (
              <label className="opcion-filtro" key={opcion.valor}>
                <input
                  type="checkbox"
                  checked={horarios.includes(opcion.valor)}
                  onChange={() =>
                    actualizarFiltro(
                      opcion.valor,
                      horarios,
                      setHorarios
                    )
                  }
                />
                <span>{opcion.texto}</span>
              </label>
            ))}
          </fieldset>

          <hr className="divisor-filtros" />

          <fieldset>
            <legend>Categoría de empleo</legend>

            {[
              { valor: 'Operativo', texto: 'Operativo' },
              { valor: 'Administrativo', texto: 'Administrativo' },
              { valor: 'Seguridad', texto: 'Seguridad' },
              { valor: 'Ventas', texto: 'Ventas' },
              { valor: 'Atencion al cliente', texto: 'Atención al cliente' }
            ].map(opcion => (
              <label className="opcion-filtro" key={opcion.valor}>
                <input
                  type="checkbox"
                  checked={categorias.includes(opcion.valor)}
                  onChange={() =>
                    actualizarFiltro(
                      opcion.valor,
                      categorias,
                      setCategorias
                    )
                  }
                />
                <span>{opcion.texto}</span>
              </label>
            ))}
          </fieldset>

        </div>
      </form>
    </aside>
  )
}