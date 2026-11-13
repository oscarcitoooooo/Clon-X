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
La autenticacion con Google mediante Firebase esta conectada y validada manualmente. Otras funciones del proyecto siguen usando datos de prueba y pueden ampliarse en los siguientes avances.

## 5. Conclusion
Con este proyecto he aprendido a crear componentes en React, usar Bootstrap, organizar el codigo e integrar autenticacion con Firebase. La bitacora registra tambien la asistencia de IA utilizada durante el desarrollo.
