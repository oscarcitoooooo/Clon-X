import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router";
import ComposePage from "./pages/ComposePage";
import FeedPage from "./pages/FeedPage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import HomePage from "./pages/HomePage";
import LoginPage, { AuthProvider, useAuth } from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserTweetsPage from "./pages/UserTweetsPage";

function PlaceholderPage({ title, description }) {
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <span className="badge rounded-pill text-bg-primary mb-3">Milestone 1</span>
        <h1 className="h3 mb-2">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
    </section>
  );
}

function PageLayout({ children }) {
  return <main className="container py-4">{children}</main>;
}

function ProtectedPage({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="container py-5 text-center" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Cargando sesión...
      </main>
    );
  }

  return user ? <PageLayout>{children}</PageLayout> : <Navigate to="/login" replace />;
}

function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navLinkClass = ({ isActive }) =>
    `nav-link px-0 ${isActive ? "active fw-semibold text-primary" : "text-secondary"}`;
  const username = user?.username ?? user?.displayName ?? user?.email?.split("@")[0] ?? "usuario";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar bg-white border-bottom shadow-sm">
      <div className="container d-flex flex-wrap justify-content-between gap-3">
        <Link
          className="navbar-brand clonx-brand d-inline-flex align-items-center gap-2 me-2"
          to="/home"
          aria-label="Clon de X, volver al inicio"
        >
          <span className="clonx-brand-mark" aria-hidden="true">X</span>
          <span>Clon de X</span>
        </Link>

        {user && (
          <>
            <nav
              className="navbar-nav flex-row flex-wrap align-items-center gap-3"
              aria-label="Navegación principal"
            >
              <NavLink className={navLinkClass} to="/home">Inicio</NavLink>
              <NavLink className={navLinkClass} to="/feed">Feed</NavLink>
              <NavLink className={navLinkClass} to="/following">Seguidos</NavLink>
              <NavLink className={navLinkClass} to="/followers">Seguidores</NavLink>
            </nav>

            <div className="d-flex align-items-center gap-3">
              <span className="small fw-semibold">@{username}</span>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-vh-100 bg-light">
          <AppHeader />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<ProtectedPage><HomePage /></ProtectedPage>} />
            <Route path="/compose" element={<ProtectedPage><ComposePage /></ProtectedPage>} />
            <Route path="/feed" element={<ProtectedPage><FeedPage /></ProtectedPage>} />
            <Route path="/following" element={<ProtectedPage><FollowingPage /></ProtectedPage>} />
            <Route path="/followers" element={<ProtectedPage><FollowersPage /></ProtectedPage>} />
            <Route path="/users/:username" element={<ProtectedPage><UserTweetsPage /></ProtectedPage>} />
            <Route
              path="*"
              element={
                <ProtectedPage>
                  <PlaceholderPage
                    title="Página no encontrada"
                    description="Usa el menú para volver a una sección del proyecto."
                  />
                </ProtectedPage>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
