import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router";
import ComposePage from "./pages/ComposePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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

function PageLayout({ children }) {
  return <main className="container py-4">{children}</main>;
}

function AppHeader() {
  const navLinkClass = ({ isActive }) =>
    `nav-link px-0 ${
      isActive ? "active fw-semibold text-primary" : "text-secondary"
    }`;

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

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/home"
            element={
              <PageLayout>
                <HomePage />
              </PageLayout>
            }
          />
          <Route
            path="/compose"
            element={
              <PageLayout>
                <ComposePage />
              </PageLayout>
            }
          />
          <Route
            path="/feed"
            element={
              <PageLayout>
                <PlaceholderPage
                  title="Feed"
                  description="Aquí aparecerán los tweets recientes."
                />
              </PageLayout>
            }
          />
          <Route
            path="/following"
            element={
              <PageLayout>
                <PlaceholderPage
                  title="Usuarios seguidos"
                  description="Aquí aparecerá la lista de usuarios que sigues."
                />
              </PageLayout>
            }
          />
          <Route
            path="/followers"
            element={
              <PageLayout>
                <PlaceholderPage
                  title="Seguidores"
                  description="Aquí aparecerá la lista de tus seguidores."
                />
              </PageLayout>
            }
          />
          <Route
            path="/users/:username"
            element={
              <PageLayout>
                <PlaceholderPage
                  title="Tweets del usuario"
                  description="Aquí aparecerá el perfil y los tweets de cada usuario."
                />
              </PageLayout>
            }
          />
          <Route
            path="*"
            element={
              <PageLayout>
                <PlaceholderPage
                  title="Página no encontrada"
                  description="Usa el menú para volver a una sección del proyecto."
                />
              </PageLayout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;