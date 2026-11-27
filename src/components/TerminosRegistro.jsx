
export default function TerminosRegistro() {
    // Al no haber pantallas para los términos, son temporales los href
    return (
        <div className="registro-terminos">
            <label className="registro-checkbox">
                <input type="checkbox" name="aceptar-servicio" required />
                <span> Aceptar <a href="/TerminosServicio"> Términos de Servicio </a>*</span>
            </label>

            <label className="registro-checkbox">
                <input type="checkbox" name="aceptar-privacidad" required />
                <span> Aceptar <a href="/AvisoPrivacidad"> Aviso de Privacidad </a>* </span>
            </label>
        </div>
    );
}
