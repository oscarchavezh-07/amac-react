export default function CasillaFormulario({ id, texto, marcada, error, onChange }) {
  return (
    <div className="registro-casilla">
      <label className="casilla" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={marcada}
                                                                                                                                                                             onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>{texto}</span>
      </label>
      {error && <p className="campo-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}