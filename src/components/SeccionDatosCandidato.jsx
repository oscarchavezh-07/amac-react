
import CampoRegistro from './CampoRegistro';

export default function SeccionDatosCandidato() {
    return (
        <>
            <fieldset className="registro-seccion registro-personales">
                <legend className="registro-legend">
                    Datos personales
                </legend>

                <hr className="login-separador-discontinuo" />

                <div className="registro-campos-personales">
                    <CampoRegistro id="nombre" name="nombre" label="Nombre completo" autoComplete="name" />
                    <CampoRegistro id="edad" name="edad" label="Edad" type="number" min="18" max="120" placeholder="Escribe tu edad" />
                    <CampoRegistro id="colonia" name="colonia" label="Colonia" autoComplete="address-level3" />
                </div>
            </fieldset>

            <fieldset className="registro-seccion registro-experiencia">
                <legend className="registro-legend">
                    Experiencia
                </legend>

                <hr className="login-separador-discontinuo" />

                <CampoRegistro id="experiencia" name="experiencia" label="Describe tu experiencia laboral" >
                    <textarea id="experiencia" name="experiencia" className="input" placeholder="Describe tu experiencia, habilidades o empleos anteriores" rows="5" required />
                </CampoRegistro>
            </fieldset>
        </>
    );
}
