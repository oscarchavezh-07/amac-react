export default function CampoFormulario({ id, etiqueta, error, children }) {
  return (
    <div className="registro-campo">
      <label className="login-etiqueta" htmlFor={id}>{etiqueta}</label>
      {children}
      {error && <p className="campo-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}