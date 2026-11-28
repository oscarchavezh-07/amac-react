# AMAC – Plataforma de Bolsa de Trabajo

Aplicación web desarrollada para la Asociación Mexicana de Ayuda a los Adultos Mayores (AMAC), cuyo objetivo es facilitar la búsqueda de oportunidades laborales, la publicación de vacantes y la gestión de solicitudes de empleo.

El sistema permite la interacción entre tres tipos de usuarios: candidatos, empresas y administradores. Cuenta con autenticación, control de acceso por roles, almacenamiento de información en una base de datos y gestión de archivos.

## 0. Miembros del equipo
* Oscar Eduardo Chávez Hernández: Mantenimiento del repositorio, flujos obligatorios [y respectivos componentes] de candidato y empresa, mantenimiento de la BD en Supabase, publicación en Vercel,
* Javier Oscar Wong Mora: Flujo de las pantallas y componentes opcionales, apoyo con la BD relacionada a los extras, corección de algunos errores
* Mariana Gomez del Angel: Diseño de la presentación y guión para video, comienzo de las pantallas de perfil
* Marco Antonio Monsivais Macias: Contribución del README. y algunos componentes de alertas
###### El readme estaba en otra rama a la que no le hicieron merge...
## 1. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Desarrollo de interfaces y componentes de la aplicación. |
| JavaScript | Lógica e interactividad del frontend. |
| HTML5 | Estructura de las páginas. |
| CSS3 | Diseño y adaptación responsiva. |
| Supabase | Backend, base de datos, autenticación y almacenamiento de archivos. |
| PostgreSQL | Administración de la información y relaciones entre tablas. |
| Supabase Auth | Registro, inicio de sesión y recuperación de contraseñas. |
| Supabase Storage | Almacenamiento de imágenes, principalmente logos de empresas. |
| Row Level Security (RLS) | Control de acceso a los registros de la base de datos. |
| Vercel | Despliegue y alojamiento de la aplicación web. |
| Git / GitHub | Control de versiones y administración del código fuente. |
| npm / Vite | Administración de dependencias y ejecución del entorno de desarrollo. |

## 2. Instalación y ejecución local

### Requisitos previos

- Node.js y npm instalados.
- Acceso al repositorio del proyecto.
- Un proyecto configurado en Supabase.
- Las variables de entorno correspondientes al proyecto.

### 2.1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

Acceder a la carpeta del proyecto:

```bash
cd nombre-del-proyecto
```

### 2.2. Instalar dependencias

Ejecutar:

```bash
npm install
```

Esto instalará las dependencias necesarias para ejecutar la aplicación.

### 2.3. Configurar las variables de entorno

Crear un archivo llamado `.env.local` en la raíz del proyecto.

Agregar las siguientes variables:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

Los valores se obtienen desde el panel de Supabase, en la configuración de API del proyecto.

**Importante:** No compartir ni subir el archivo `.env.local` al repositorio. Debe estar incluido en `.gitignore`. La clave `anon` o publishable está diseñada para utilizarse desde el navegador junto con las políticas RLS; nunca debe colocarse una clave `service_role` o secret key en el frontend.

### 2.4. Ejecutar el proyecto

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará una dirección local, normalmente:

```text
http://localhost:5173
```

Abrir dicha dirección en el navegador para utilizar la aplicación.

Para generar una versión de producción:

```bash
npm run build
```

Para probar localmente la versión compilada:

```bash
npm run preview
```

## 3. Configuración de Supabase

El proyecto utiliza Supabase como backend. La base de datos está organizada principalmente en las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `perfiles` | Información de los usuarios, incluyendo rol, datos personales, información empresarial y estado de aprobación. |
| `vacantes` | Vacantes publicadas por las empresas, con información del puesto, sueldo, ubicación, horario y estado. |
| `solicitudes` | Postulaciones realizadas por los candidatos y seguimiento de su estatus. |
| `favoritos` | Vacantes guardadas por los candidatos para consultarlas posteriormente. |

También se utiliza el bucket de almacenamiento `logos` para guardar las imágenes de las empresas.

### Roles del sistema

- **Candidato:** consulta vacantes, guarda favoritas, realiza postulaciones y consulta el seguimiento de sus solicitudes. Requiere aprobación de AMAC para postularse.
- **Empresa:** publica y administra vacantes, consulta candidatos que aplicaron y actualiza el estado de sus solicitudes.
- **Administrador:** consulta los perfiles de los candidatos y aprueba o rechaza sus registros.

### Relaciones principales

- Cada perfil está relacionado con un usuario de Supabase Auth mediante su identificador UUID.
- Cada vacante pertenece a una empresa mediante `empresa_id`.
- Cada solicitud relaciona una vacante con un candidato.
- Cada favorito relaciona un candidato con una vacante.
- Los registros relacionados se eliminan en cascada cuando se elimina el perfil, la vacante o el registro correspondiente.

<img width="2260" height="1374" alt="image" src="https://github.com/user-attachments/assets/8202a9f4-bc1f-4346-bcc0-346c49d2097c" />


### Seguridad y políticas RLS

Todas las tablas principales tienen habilitado Row Level Security (RLS). Esto permite establecer qué registros puede consultar o modificar cada usuario según su sesión y rol.

Las políticas se describen a continuación.

#### 3.1. Tabla `perfiles`

| Política | Funcionamiento |
|---|---|
| Cada quien ve su perfil | Permite que cada usuario consulte su propio perfil. |
| Todos ven los perfiles de empresas | Permite consultar los perfiles de las empresas para mostrar su información en las vacantes. |
| La empresa ve a quien aplicó a sus vacantes | Permite que una empresa consulte los perfiles de los candidatos que han aplicado a alguna de sus vacantes. |
| Cada quien edita su perfil | Permite modificar únicamente el perfil correspondiente al usuario autenticado. |

**Restricciones adicionales:**
- Los usuarios no pueden modificar directamente su propio rol.
- El campo `aprobado` no puede modificarse mediante una actualización convencional.
- Los campos editables se limitan a nombre, teléfono, edad, colonia, experiencia y giro.
- El logo cuenta con un permiso de actualización específico.

#### 3.2. Tabla `vacantes`

| Política | Funcionamiento |
|---|---|
| Ver vacantes activas o las propias | Permite consultar las vacantes activas y las vacantes publicadas por la empresa autenticada. |
| El candidato sigue viendo las vacantes a las que aplicó | Permite que un candidato siga consultando una vacante aunque haya sido pausada o cerrada, si ya había aplicado a ella. |
| Solo empresas publican, a su nombre | Restringe la creación de vacantes a usuarios con rol de empresa y exige que la vacante pertenezca a quien la publica. |
| La empresa edita sus vacantes | Permite modificar únicamente las vacantes pertenecientes a la empresa autenticada. |

#### 3.3. Tabla `solicitudes`

| Política | Funcionamiento |
|---|---|
| Candidato ve las suyas; empresa ve las de sus vacantes | Permite al candidato consultar sus propias solicitudes y a la empresa consultar las solicitudes correspondientes a sus vacantes. |
| Solo candidatos aprobados se postulan | Permite insertar solicitudes únicamente a candidatos autenticados, aprobados por AMAC y con estatus inicial `Enviada`. |
| Candidato cancela si no está resuelta | Permite cancelar solicitudes propias que estén `Enviada` o `En revisión`. |
| Empresa cambia el estatus | Permite a la empresa propietaria de la vacante actualizar el estatus de las solicitudes correspondientes, utilizando los estados permitidos. |

**Restricciones adicionales:**
- Una solicitud solamente puede modificar su estatus mediante los permisos de actualización concedidos.
- La llave única `(vacante_id, candidato_id)` impide que un candidato se postule dos veces a la misma vacante.
- Un trigger registra automáticamente la fecha de modificación del estatus en `estatus_actualizado_en`.
- La columna `etapa` permite registrar el avance del proceso de selección.

#### 3.4. Tabla `favoritos`

| Política | Funcionamiento |
|---|---|
| Candidato ve sus favoritas | Permite consultar únicamente los favoritos del candidato autenticado. |
| Candidato guarda favoritas | Permite guardar vacantes siempre que el usuario tenga rol de candidato y el registro corresponda a su identificador. |
| Candidato quita favoritas | Permite eliminar únicamente los favoritos pertenecientes al candidato autenticado. |

La llave primaria compuesta `(candidato_id, vacante_id)` evita guardar una misma vacante más de una vez.

#### 3.5. Supabase Storage: bucket `logos`

| Política | Funcionamiento |
|---|---|
| Empresa sube su logo | Permite subir imágenes únicamente a empresas autenticadas y dentro de su propia carpeta. |
| Empresa reemplaza su logo | Permite actualizar archivos de la carpeta correspondiente a la empresa autenticada. |
| Empresa ve sus archivos de logo | Permite consultar los archivos propios de la empresa. |

**Restricciones del almacenamiento:**
- Bucket: `logos`.
- Tamaño máximo: 2 MB.
- Formatos permitidos: PNG, JPEG y WebP.
- Cada empresa almacena sus archivos en una carpeta identificada con su UUID.
- El bucket es público para permitir mostrar las imágenes mediante sus URL públicas.

#### 3.6. Funciones auxiliares de seguridad

Se utilizan funciones de PostgreSQL para centralizar validaciones:

| Función | Propósito |
|---|---|
| `mi_rol()` | Obtiene el rol del usuario autenticado. |
| `candidato_aprobado()` | Comprueba que el usuario sea candidato y tenga autorización para postularse. |
| `candidato_aplico(vid)` | Comprueba si un candidato ya aplicó a una vacante. |
| `empresa_ve_candidato(cid)` | Comprueba si un candidato aplicó a alguna vacante de la empresa autenticada. |
| `cambiar_aprobacion(cid, valor)` | Permite que un administrador apruebe o rechace el registro de un candidato. |

Estas funciones permiten mantener las reglas de seguridad en la base de datos y evitar depender exclusivamente de las validaciones realizadas en React.

## 4. Requerimientos funcionales implementados

La siguiente tabla presenta el estado de los requerimientos funcionales considerados en el proyecto.

**Significado de los estados:**

- ✅ **Completo:** funcionalidad implementada y disponible.
- 🟡 **Parcial:** existe una implementación, pero no cubre todos los criterios de aceptación originales.
- ❌ **Pendiente:** funcionalidad no implementada.

| RF | Requerimiento | Estado |
|---|---|:---:|
| RF-001 | Consultar ofertas de vacantes | ✅ |
| RF-002 | Filtrar vacantes por horario y categoría | ✅ |
| RF-003 | Consultar información de una vacante | ✅ |
| RF-004 | Aplicar a una vacante | ✅ |
| RF-005 | Consultar mis solicitudes | ✅ |
| RF-006 | Retirar una solicitud | ✅ |
| RF-007 | Buscar vacantes por palabra clave | 🟡 |
| RF-008 | Iniciar sesión | ✅ |
| RF-009 | Cerrar sesión | ✅ |
| RF-010 | Restringir el acceso según el rol | ✅ |
| RF-011 | Registrar un candidato | 🟡 |
| RF-012 | Registrar perfil profesional del candidato | 🟡 |
| RF-013 | Aceptar términos y política de privacidad | ❌ |
| RF-014 | Editar el perfil del candidato | 🟡 |
| RF-015 | Registrar una empresa | 🟡 |
| RF-016 | Cargar logo y banner de la empresa | 🟡 |
| RF-017 | Editar perfil de la empresa | 🟡 |
| RF-018 | Validar registro de empresas | ❌ |
| RF-019 | Publicar vacante | ✅ |
| RF-020 | Consultar vacantes propias | ✅ |
| RF-021 | Editar, pausar o cerrar vacantes | ✅ |
| RF-022 | Consultar solicitudes recibidas | ✅ |
| RF-023 | Consultar detalle de candidatos postulados | 🟡 |
| RF-024 | Actualizar estatus de una solicitud | ✅ |
| RF-025 | Notificar a la empresa de una nueva solicitud | ❌ |
| RF-026 | Notificar al candidato el cambio de estatus | ❌ |
| RF-027 | Moderar vacantes | ❌ |
| RF-028 | Adjuntar CV | ❌ |
| RF-029 | Recuperar contraseña | ✅ |
| RF-030 | Verificar medio de contacto | ❌ |
| RF-031 | Mostrar visión, misión y motivos de AMAC | 🟡 |
| RF-032 | Mostrar descripción, gobernanza y organización | 🟡 |
| RF-033 | Mostrar actividades y líneas de acción | 🟡 |
| RF-034 | Mostrar enlace a donativos | 🟡 |
| RF-035 | Consultar CV de candidatos | ❌ |
| RF-036 | Validación de CV adjunto | ❌ |
| RF-037 | Filtrar vacantes por distancia | ❌ |
| RF-038 | Reportar contratación | ❌ |
| RF-039 | Reportar no contratación | ❌ |
| RF-040 | Filtrado de candidatos | 🟡 |
| RF-041 | Guardar vacantes favoritas | ✅ |
| RF-043 | Notificar vacante rechazada o cancelada | ❌ |
| RF-044 | Reportar una vacante | ❌ |
| RF-045 | Mostrar listado de candidatos al administrador | 🟡 |
| RF-046 | Mostrar listado de empresas al administrador | ❌ |
| RF-047 | Eliminar o desactivar cuenta | ❌ |
| RF-048 | Crear cuenta con servicios externos (Google) | ❌ |
| RF-049 | Método de contacto preferido | 🟡 |
| RF-050 | Accesibilidad | 🟡 |
| RF-051 | Opción llamar desde tarjeta informativa | ✅ |
| RF-052 | Contactar a un empleado de AMAC | 🟡 |
| RF-053 | Visitar perfil de las empresas | 🟡 |
| RF-054 | Validar registro de un candidato | 🟡 |
| RF-055 | Definir y mostrar el proceso de selección | 🟡 |


El SQL se encuentra dentro de la carpeta de supabase
