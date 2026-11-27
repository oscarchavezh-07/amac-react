
export default function CampoRegistro({
    id,
    label,
    type = 'text',
    name,
    placeholder = 'Escribe una respuesta',
    required = true,
    children,
    ...props
}) {
    return (
        <div className="registro-campo">
            <label htmlFor={id} className="login-etiqueta">
                {label}{required && '*'}
            </label>

            {children || (
                <input
                    type={type}
                    id={id}
                    name={name}
                    className="input"
                    placeholder={placeholder}
                    required={required}
                    {...props}
                />
            )}
        </div>
    );
}
