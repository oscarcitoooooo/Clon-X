import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { Link, Navigate, useNavigate } from "react-router";
import { firebaseAuth, firestoreDb } from "../firebase";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

async function ensureGoogleProfile(firebaseUser) {
  if (!firestoreDb) {
    throw new Error("Firebase no está configurado.");
  }

  const userRef = doc(firestoreDb, "users", firebaseUser.uid);
  const profileSnapshot = await getDoc(userRef);

  if (profileSnapshot.exists()) return;

  const usernameLower = `google_${firebaseUser.uid
    .slice(0, 10)
    .toLowerCase()}`;
  const usernameRef = doc(firestoreDb, "usernameIndex", usernameLower);
  const usernameSnapshot = await getDoc(usernameRef);

  if (
    usernameSnapshot.exists() &&
    usernameSnapshot.data().uid !== firebaseUser.uid
  ) {
    throw new Error("No se pudo crear un nombre de usuario único.");
  }

  const batch = writeBatch(firestoreDb);

  batch.set(userRef, {
    fullName: firebaseUser.displayName || usernameLower,
    username: usernameLower,
    usernameLower,
    photoURL: firebaseUser.photoURL || "",
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
  });

  if (!usernameSnapshot.exists()) {
    batch.set(usernameRef, { uid: firebaseUser.uid });
  }

  await batch.commit();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(firebaseAuth));

  useEffect(() => {
    if (!firebaseAuth) return undefined;

    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  async function login(username, password) {
    const normalizedUsername = String(username ?? "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    if (!firebaseAuth) {
      throw new Error(
        "Firebase no está configurado. Revisa el archivo .env.local.",
      );
    }

    const authEmail = `${normalizedUsername}@clonx.app`;
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      authEmail,
      password,
    );

    setUser(credential.user);
    return credential.user;
  }

  async function loginWithGoogle() {
    if (!firebaseAuth) {
      throw new Error(
        "Firebase no está configurado. Revisa el archivo .env.local.",
      );
    }

    const result = await signInWithPopup(firebaseAuth, googleProvider);
    await ensureGoogleProfile(result.user);

    setUser(result.user);
    return result.user;
  }

  async function logout() {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The hook shares the auth context with the provider exported by this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

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

  return (
    error.message ||
    "No se pudo iniciar sesión con Google. Inténtalo de nuevo."
  );
}

function getPasswordErrorMessage(error) {
  if (
    ["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(
      error.code,
    )
  ) {
    return "Nombre de usuario o contraseña incorrectos.";
  }

  if (error.code === "auth/too-many-requests") {
    return "Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return error.message || "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function LoginPage() {
  const [error, setError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <main className="container py-5 text-center" role="status">
        <span
          className="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        />
        Cargando sesión...
      </main>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPasswordLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login(formData.get("username"), formData.get("password"));
      navigate("/home", { replace: true });
    } catch (signInError) {
      setError(getPasswordErrorMessage(signInError));
    } finally {
      setPasswordLoading(false);
    }
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
                <span className="badge rounded-pill text-bg-primary mb-3">
                  Clon de X
                </span>
                <h1 className="h3 mb-2">Iniciar sesión</h1>
                <p className="text-secondary mb-0">
                  Vuelve a conectarte con la comunidad.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="username">
                    Nombre de usuario
                  </label>
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
                  <label className="form-label" htmlFor="password">
                    Contraseña
                  </label>
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

                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
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
                {googleLoading
                  ? "Conectando con Google..."
                  : "Continuar con Google"}
              </button>

              <p className="text-center text-secondary mt-4 mb-0">
                ¿Todavía no tienes cuenta?{" "}
                <Link className="text-decoration-none" to="/register">
                  Regístrate
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
