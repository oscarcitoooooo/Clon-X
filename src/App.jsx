import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router";

function PlaceholderPage({ title, description }) {
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <span className="badge rounded-pill text-bg-primary mb-3">
          Milestone 1
        </span>
        <h1 className="h3 mb-2">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
    </section>
  );
}

function AppHeader() {
  const navLinkClass = ({ isActive }) =>
    `nav-link px-0 ${isActive ? "active fw-semibold text-primary" : "text-secondary"}`;

  return (
    <header className="navbar bg-white border-bottom shadow-sm">
      <div className="container d-flex flex-wrap justify-content-between gap-3">
        <Link className="navbar-brand fw-bold text-primary me-2" to="/home">
          Clon de X
        </Link>

        <nav
          className="navbar-nav flex-row flex-wrap align-items-center gap-3"
          aria-label="Navegación principal"
        >
          <NavLink className={navLinkClass} to="/home">
            Inicio
          </NavLink>
          <NavLink className={navLinkClass} to="/feed">
            Feed
          </NavLink>
          <NavLink className={navLinkClass} to="/following">
            Seguidos
          </NavLink>
          <NavLink className={navLinkClass} to="/followers">
            Seguidores
          </NavLink>
        </nav>

        <div className="d-flex align-items-center gap-3">
          <span className="small fw-semibold">@oscar</span>
          <Link className="btn btn-outline-secondary btn-sm" to="/login">
            Cerrar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light">
        <AppHeader />

        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            <Route
              path="/login"
              element={
                <PlaceholderPage
                  title="Iniciar sesión"
                  description="Aquí construiremos el formulario de acceso."
                />
              }
            />
            <Route
              path="/register"
              element={
                <PlaceholderPage
                  title="Crear cuenta"
                  description="Aquí construiremos el formulario de registro."
                />
              }
            />
            <Route
              path="/home"
              element={
                <PlaceholderPage
                  title="Inicio"
                  description="Aquí aparecerán tu perfil, tus contadores y el enlace para publicar."
                />
              }
            />
            <Route
              path="/compose"
              element={
                <PlaceholderPage
                  title="Publicar un tweet"
                  description="Aquí construiremos el formulario de publicación."
                />
              }
            />
            <Route
              path="/feed"
              element={
                <PlaceholderPage
                  title="Feed"
                  description="Aquí aparecerán los tweets recientes."
                />
              }
            />
            <Route
              path="/following"
              element={
                <PlaceholderPage
                  title="Usuarios seguidos"
                  description="Aquí aparecerá la lista de usuarios que sigues."
                />
              }
            />
            <Route
              path="/followers"
              element={
                <PlaceholderPage
                  title="Seguidores"
                  description="Aquí aparecerá la lista de tus seguidores."
                />
              }
            />
            <Route
              path="/users/:username"
              element={
                <PlaceholderPage
                  title="Tweets del usuario"
                  description="Aquí aparecerá el perfil y los tweets de cada usuario."
                />
              }
            />
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Página no encontrada"
                  description="Usa el menú para volver a una sección del proyecto."
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;