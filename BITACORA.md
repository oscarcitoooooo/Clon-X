# Clon de X - Bitacora de desarrollo


## Link  https://chatgpt.com/share/6ae52c96-a2ec-83e9-a799-3f4adbcff81f
## 1. Descripcion del proyecto
El proyecto consiste en crear un clon de X usando React y Bootstrap. La idea es hacer una pagina parecida a X con inicio de sesion, perfiles y publicaciones.

## 2. Actividades realizadas

### 2.1 Inicio de sesion
Se creo un formulario para iniciar sesion con usuario y contraseña, usando datos de prueba.

### 2.2 Creacion de usuarios
Se creo el archivo `users.js` para guardar usuarios de prueba con sus datos.

### 2.3 Bootstrap
Se instalo Bootstrap para mejorar el diseño de la pagina y usar botones, formularios y estilos.

### 2.4 Logo de X
Se cambio el titulo de la pagina por el logo de X, que lleva al inicio.

### 2.5 Publicar tweets
Se creo un formulario para escribir tweets con un limite de 280 caracteres.

### 2.6 Seguidores y seguidos
Se hicieron paginas para mostrar los seguidores y las personas que sigue cada usuario, ordenadas alfabeticamente.

### 2.7 Paginacion
Se trabajo en mostrar maximo 10 elementos por pagina para que las listas no sean tan largas.

### 2.8 Inicio con Google
Se conecto el boton de Google con Firebase Authentication mediante el SDK web. La sesion se conserva al actualizar y el cierre de sesion devuelve al login.


### 2.9 Integracion con Firebase Authentication
**Prompt de Oscar:** “Empecemos con la configuracion de Firebase para que el inicio de sesion con Google funcione; guiame paso por paso.”

**Asistencia recibida:** Se dieron instrucciones para crear el proyecto Firebase, registrar la app web, habilitar Google como proveedor y autorizar `localhost`. Se instalo el SDK `firebase` y se conecto el boton con `signInWithPopup`, el estado de sesion con `onAuthStateChanged` y el cierre con `signOut`. Tambien se actualizaron las rutas protegidas y la pagina de inicio para mostrar la cuenta autenticada.

**Archivos modificados:** `package.json`, `package-lock.json`, `src/App.jsx`, `src/pages/LoginPage.jsx` y `src/pages/HomePage.jsx`. La configuracion local esta en `.env.local`, archivo ignorado por Git.

**Validacion manual de Oscar:** El acceso con Google llego a `/home`, la sesion permanecio despues de actualizar la pagina y “Cerrar sesion” regreso a `/login`.

## 3. Tecnologias usadas
- React
- JavaScript
- Bootstrap
- Vite

## 4. Estado del proyecto
La autenticacion con Google y con usuario y contrasena esta conectada. La publicacion de tweets, el feed, los perfiles y las listas de seguidores/seguidos usan Firestore. Las pantallas se validan manualmente durante el desarrollo.

## 2.14 Perfiles y seguidores conectados con Firestore
**Fecha:** 2026-11-13
**Herramienta y modelo:** Codex, GPT-6
**Solicitud del estudiante:** Implementar la carga de perfiles, publicaciones y seguidores reales con Firestore, conservando los flujos de autenticación y seguimiento existentes.
**Asistencia recibida:** Se conectó la ruta de perfil al índice de nombres de usuario y a las publicaciones de Firestore; se conectó la lista de seguidores a las relaciones donde la cuenta autenticada es el destinatario; se agregó el estado de carga y los mensajes de error/vacío; y se habilitó seguir o dejar de seguir desde el perfil. Las relaciones de seguimiento son visibles para cuentas autenticadas para mostrar perfiles, listas y contadores en tiempo real. El formato de fecha acepta marcas de tiempo de Firestore.
**Archivos modificados:** `src/pages/UserTweetsPage.jsx`, `src/pages/FollowersPage.jsx`, `src/components/TweetCard.jsx`, `firestore.rules`, `README.md`.

## 5. Conclusion
Con este proyecto he aprendido a crear componentes en React, usar Bootstrap, organizar el codigo e integrar autenticacion con Firebase. La bitacora registra tambien la asistencia de IA utilizada durante el desarrollo.

## 2.10 Inicio de sesion con usuario y contrasena en Firebase
**Fecha y hora:** 2026-11-13 19:05 (America/Bogota)  
**Herramienta y modelo:** Codex, GPT-6  
**Mensaje del estudiante:** “si” (respuesta a la propuesta de usar un identificador interno derivado del nombre de usuario para conservar el inicio de sesion por usuario y mantener privado el correo real).  
**Resumen de la respuesta:** Se conecto el inicio de sesion por nombre de usuario a Firebase Authentication usando el identificador interno acordado. Se retiro el acceso local de demostracion para que las cuentas nuevas utilicen Firebase; se mantuvo el acceso con Google y se ajusto el encabezado para mostrar el nombre de usuario.  
**Archivos modificados:** `src/pages/LoginPage.jsx`, `src/App.jsx`.

## 2.11 Documentacion de Firebase y configuracion local
**Fecha y hora:** 2026-11-13 19:23 (America/Bogota)  
**Herramienta y modelo:** Codex, GPT-6  
**Mensaje del estudiante:** “si” (confirmacion de que el inicio con Google siguio funcionando).  
**Resumen de la respuesta:** Se actualizo el README para reflejar la autenticacion y el estado de Milestone 2, se agrego una plantilla de variables locales para Firebase y se versionaron las reglas actuales de Firestore. La plantilla no contiene credenciales reales.  
**Archivos creados o modificados:** `README.md`, `.env.example`, `firestore.rules`.

## 2.12 Publicacion de tweets en tiempo real con Firestore

**Fecha:** 2026-11-13

**Herramienta y modelo:** Codex, GPT-6

**Resumen de la solicitud del estudiante:** Conectar el formulario de publicacion, el feed y la pagina de inicio con Firestore; resolver el aviso que aparecia cuando una cuenta de Google no tenia perfil guardado.

**Asistencia recibida:** Se agregaron reglas para validar contenido y autor en la coleccion `tweets`; se conecto el formulario para guardar el contenido, UID, nombre de usuario y fecha del servidor; el feed y la pagina de inicio se conectaron a actualizaciones en tiempo real. Se agrego la creacion de un perfil publico para cuentas de Google que aun no tenian uno.

**Archivos modificados:** `firestore.rules`, `src/pages/ComposePage.jsx`, `src/pages/FeedPage.jsx`, `src/pages/HomePage.jsx` y `src/pages/LoginPage.jsx`.

**Validacion manual del equipo:** Se inicio sesion con Google, se publico un tweet y se confirmo que aparecio en el feed y en la pagina de inicio.

## 2.13 Busqueda y seguimiento de usuarios por nombre

**Fecha:** 2026-11-13

**Herramienta y modelo:** Codex, GPT-6

**Resumen de la solicitud del estudiante:** Definir la siguiente tarea del Milestone 2 para que Oscar implemente la busqueda de usuarios y el seguimiento con Firestore.

**Asistencia recibida:** Se definio el issue y se conecto la pagina de usuarios seguidos con la busqueda normalizada por nombre de usuario, la creacion y eliminacion de relaciones en Firestore, y reglas que protegen las relaciones del usuario autenticado. Se actualizaron el README y esta bitacora.

**Archivos modificados:** `firestore.rules`, `src/pages/FollowingPage.jsx`, `README.md` y `BITACORA.md`.

**Validacion manual:** Pendiente de revision y prueba por Oscar.

## 2.15 Contadores de seguidores y seguidos en tiempo real

**Fecha:** 2026-11-13

**Herramienta y modelo:** Codex, GPT-6

**Resumen de la solicitud del estudiante:** Corregir los contadores para que reflejen inmediatamente las relaciones de seguimiento entre Oscar y Yoseth.

**Asistencia recibida:** Se reemplazaron las consultas generales de relaciones por contadores guardados en el perfil público. Seguir y dejar de seguir ahora usa una transacción de Firestore que actualiza la relación y los dos contadores de forma atómica. Las reglas limitan la lectura a las relaciones salientes propias y a las entrantes dirigidas al usuario autenticado, y exigen que cada cambio de contador corresponda a una relación creada o eliminada en la misma transacción. Inicio y perfil escuchan el documento público para reflejar los contadores en tiempo real.

**Archivos modificados:** `src/data/followService.js`, `src/pages/FollowingPage.jsx`, `src/pages/HomePage.jsx`, `src/pages/UserTweetsPage.jsx`, `firestore.rules`, `README.md` y `BITACORA.md`.

**Nota de migración:** Los perfiles que ya tenían relaciones antes de guardar contadores deben inicializar una sola vez `followersCount` y `followingCount` con los totales reales desde Firebase Console; el cliente no puede recalcularlos leyendo relaciones ajenas.

**Validacion manual:** Pendiente de prueba con dos cuentas autenticadas y aprobacion del equipo.

## 2.16 Requisitos finales de Firestore y perfiles
**Fecha:** 2026-11-14
**Herramienta y modelo:** Codex, GPT-6
**Solicitud del estudiante:** Completar los requisitos finales del proyecto: filtrar el feed por relaciones, paginar listas de perfiles, permitir seguir desde seguidores, proteger las relaciones y el correo privado, actualizar la documentación y verificar el proyecto.

**Asistencia recibida:** Se conectó el feed en tiempo real a los tweets del usuario autenticado, sus seguidores y las cuentas que sigue, ordenados del más reciente al más antiguo y paginados de 10 en 10. Se añadieron pestañas de seguidores y seguidos en perfiles, ordenadas por nombre y paginadas, con acciones para seguir o dejar de seguir. Las acciones siguen usando transacciones que actualizan la relación y ambos contadores. Se ajustaron las reglas para permitir lectura autenticada de listas públicas y conservar las escrituras limitadas al propietario de la relación y la lectura de correo privado limitada a su dueño. Se actualizó este registro y el README con las instrucciones de revisión final.

**Archivos modificados:** `src/pages/FeedPage.jsx`, `src/pages/FollowersPage.jsx`, `src/pages/UserTweetsPage.jsx`, `src/components/UserCard.jsx`, `src/components/ProfileRelationshipLists.jsx`, `firestore.rules`, `README.md` y `BITACORA.md`.

**Verificación automatizada:** `npm.cmd run lint` finalizó sin errores y `npm.cmd run build` completó correctamente. Vite mostró únicamente el aviso de que el archivo JavaScript principal supera 500 kB minificado.
**Validación manual con dos cuentas:** Pendiente de que Oscar y Yoseth revisen seguimiento, contadores, feed filtrado, listas, paginación y privacidad en Firebase. La revisión requiere publicar las reglas actualizadas y completar una consulta de grupo de colección con su índice de Firestore.

## 2.17 Eliminación de tweets propios
**Fecha:** 2026-11-14
**Herramienta y modelo:** Codex, GPT-6
**Solicitud del estudiante:** Agregar una opción funcional para eliminar un tweet propio y quitarlo de las publicaciones y feeds de todos los usuarios.

**Asistencia recibida:** Se añadió un botón de eliminación visible solo en las publicaciones del usuario autenticado, con confirmación antes de borrar y mensajes de error si Firestore rechaza la operación. Las reglas de Firestore permiten borrar un tweet únicamente cuando su `authorId` coincide con el UID autenticado y mantienen bloqueadas las modificaciones del contenido. Las vistas que escuchan los tweets en tiempo real reflejan la eliminación automáticamente.

**Archivos modificados:** `src/components/TweetCard.jsx`, `firestore.rules`, `README.md` y `BITACORA.md`.

**Validación manual:** Pendiente de publicar las reglas en Firebase y confirmar con dos cuentas que el autor puede borrar su tweet, otro usuario no ve el botón y el tweet desaparece del feed y perfil después del borrado.

## 2.18 Búsqueda global de usuarios
**Fecha:** 2026-11-14
**Herramienta y modelo:** Codex, GPT-6
**Solicitud del estudiante:** Mover el buscador de usuarios desde la página «Seguidos» a la parte superior de la aplicación.

**Asistencia recibida:** Se agregó una búsqueda persistente en la barra superior para localizar perfiles por nombre de usuario, mostrar el resultado, abrir su perfil y seguir o dejar de seguir sin salir de la página actual. La página «Seguidos» ahora se concentra en listar las cuentas seguidas.

**Archivos modificados:** `src/components/UserSearch.jsx`, `src/App.jsx`, `src/index.css`, `src/pages/FollowingPage.jsx`, `README.md` y `BITACORA.md`.

**Validación manual:** Pendiente de buscar un usuario desde la barra superior, abrir su perfil y comprobar las acciones de seguimiento con dos cuentas.
