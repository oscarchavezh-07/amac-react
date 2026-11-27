import iconoAlerta from '../assets/icono-alerta.svg'










export default function AlertaError({ id, children }) {
  return (
    <div className="alerta-error" id={id} role="alert">
      <img className="alerta-error__icono" src={iconoAlerta} alt="" width="33" height="34" />
      <p>{children}</p>
    </div>
  )
}