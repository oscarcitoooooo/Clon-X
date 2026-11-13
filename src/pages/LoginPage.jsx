import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Link, Navigate, useNavigate } from "react-router";
import { users } from "../data/mockData";

const AuthContext = createContext(null);
const STORAGE_KEY = "clon-x-demo-user";
const DEMO_USERNAME = "oscar";
const DEMO_PASSWORD = "clonx123";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
const googleProvider = new GoogleAuthProvider();

function getStoredUser() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return null;

    const { userId } = JSON.parse(storedValue);
    return users.find((user) => user.id === userId) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser ?? getStoredUser());
      setLoading(false);
    });
  }, []);

  function login(username, password) {
    const normalizedUsername = String(username ?? "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    if (normalizedUsername !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return false;
    }

    const demoUser = users.find((candidate) => candidate.username === DEMO_USERNAME);
    if (!demoUser) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: demoUser.id }));
    setUser(demoUser);
    return true;
  }

  async function loginWithGoogle() {
    if (!firebaseAuth) {
      throw new Error("Firebase no está configurado. Revisa el archivo .env.local.");
    }

    const result = await signInWithPopup(firebaseAuth, googleProvider);
    localStorage.removeItem(STORAGE_KEY);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    localStorage.removeItem(STORAGE_KEY);
    if (firebaseAuth) await signOut(firebaseAuth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}

function getGoogleErrorMessage(error) {
  if (error.code === "auth/popup-closed-by-user") {
    return "Se cerró la ventana de Google antes de completar el acceso.";
  }
  if (error.code === "auth/popup-blocked") {
    return "El navegador bloqueó la ventana. Permite las ventanas emergentes e inténtalo otra vez.";
  }
  if (error.code === "auth/unauthorized-domain") {
    return "Este dominio no está autorizado en Firebase Authentication.";
  }
  return error.message || "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";
}

function LoginPage() {
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <main className="container py-5 text-center" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Cargando sesión...
      </main>
    );
  }
  if (user) return <Navigate to="/home" replace />;

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const isLoggedIn = login(formData.get("username"), formData.get("password"));

    if (!isLoggedIn) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    setError("");
    navigate("/home", { replace: true });
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/home", { replace: true });
    } catch (signInError) {
      setError(getGoogleErrorMessage(signInError));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="badge rounded-pill text-bg-primary mb-3">Clon de X</span>
                <h1 className="h3 mb-2">Iniciar sesión</h1>
                <p className="text-secondary mb-0">Vuelve a conectarte con la comunidad.</p>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="username">Nombre de usuario</label>
                  <input
                    className="form-control"
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Escribe tu nombre de usuario"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="password">Contraseña</label>
                  <input
                    className="form-control"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Escribe tu contraseña"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit">Iniciar sesión</button>
              </form>

              <div className="d-flex align-items-center gap-3 my-4">
                <hr className="flex-grow-1" />
                <span className="small text-secondary">o continúa con</span>
                <hr className="flex-grow-1" />
              </div>

              <button
                className="btn btn-outline-secondary w-100"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
              </button>

              <p className="text-center text-secondary mt-4 mb-0">
                ¿Todavía no tienes cuenta?{" "}
                <Link className="text-decoration-none" to="/register">Regístrate</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
