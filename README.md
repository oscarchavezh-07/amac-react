AMAC - Plataforma de empleo
Proyecto final de Aplicaciones Web, Entrega 3 (React, Supabase y Vercel).

Integrantes
Integrante	Qué hizo
Oscar Chávez	Base de datos y políticas RLS, flujo del candidato, flujo de la empresa, integración y despliegue
Javier Wong	Inicio y cierre de sesión
Mariana Gomez	Funcionalidades extra
Marco Monsivais	Componentes de alertas (Modal, AlertaError, ModalConfirmacion, ModalMensaje) y README. Desarrolló también una versión del flujo de empresa en las ramas feat/pagina-registro-empresa, feat/publicar-vacante, feat/mis-vacantes y feat/solicitudes-recibidas; se usó el flujo de respaldo porque los extras ya estaban probados con él.
Tecnologías
React con Vite
React Router
Supabase (PostgreSQL, Auth y RLS)
Vercel
Cómo correr el proyecto
npm install
Crear el archivo .env.local en la raíz del proyecto:

VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
npm run dev
Cuentas de prueba
Tipo	Correo	Contraseña
Candidato aprobado	elena@mail.com	12345678
Candidato sin aprobar	pedro@mail.com	12345678
Empresa	aperture@mail.com	12345678
Empresa	josemorales@gmail.com	12345678
Base de datos
Diagrama de la base de datos

El SQL final está en supabase/esquema.sql.

Políticas RLS
perfiles

Cada quien ve su perfil: un usuario solo lee su propio perfil.
Todos ven los perfiles de empresas: para mostrar el nombre de la empresa en las vacantes.
La empresa ve a quien aplicó a sus vacantes: solo puede leer los perfiles de sus postulantes.
Cada quien edita su perfil: solo el dueño lo actualiza, y nadie puede cambiarse el rol ni el campo aprobado.
vacantes

Ver vacantes activas o las propias: el público ve las activas; la empresa también ve las suyas pausadas o cerradas.
El candidato sigue viendo las vacantes a las que aplicó, aunque se pausen.
Solo empresas publican, a su nombre.
La empresa edita sus vacantes.
solicitudes

El candidato ve las suyas y la empresa ve las de sus vacantes.
Solo candidatos aprobados se postulan, y la solicitud empieza como Enviada.
El candidato cancela solo si la solicitud está Enviada o En revisión.
La empresa cambia el estatus de las solicitudes de sus vacantes a En revisión, Aceptada o Rechazada, y nunca si ya está Cancelada.
De una solicitud solo se puede modificar el estatus.
Requerimientos implementados
#	Funcionalidad	RF	Estado
1	Listado de vacantes desde la BD	RF-001	Completo
2	Búsqueda y filtros	RF-002, RF-007	Completo
3	Detalle de vacante	RF-003, RF-051	Completo
4	Registro de candidato	RF-011, RF-012, RF-013	Completo
5	Inicio y cierre de sesión	RF-008, RF-009	Completo
6	Postularme	RF-004, RF-054	Completo
7	Mis solicitudes y cancelar	RF-005, RF-006	Completo
8	Registro de empresa	RF-015	Completo
9	Publicar vacante	RF-019	Completo
10	Mis vacantes	RF-020, RF-021	Completo
11	Solicitudes recibidas	RF-022, RF-024	Completo
12	Rutas protegidas por rol	RF-010	Completo
