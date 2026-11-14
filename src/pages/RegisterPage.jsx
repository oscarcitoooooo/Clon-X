import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router";
import { firebaseAuth, firestoreDb } from "../firebase";

async function hashEmail(email) {
  const bytes = new TextEncoder().encode(email);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function registrationErrorMessage(error) {
  if (error.message === "USERNAME_TAKEN") {
    return "Ese nombre de usuario ya está ocupado.";
  }
  if (error.code === "auth/email-already-in-use") {
    return "Ese nombre de usuario ya tiene una cuenta.";
  }
  if (error.code === "auth/weak-password") {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (error.code === "permission-denied") {
    return "Ese correo ya está registrado, o las reglas de Firestore no permiten guardar el perfil.";
  }

  return error.message || "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

function RegisterPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!firebaseAuth || !firestoreDb) {
      setError("Firebase no está configurado. Revisa el archivo .env.local.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const usernameLower = username.replace(/^@/, "").toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!/^[a-z0-9_]{3,20}$/.test(usernameLower)) {
      setError("El usuario debe tener entre 3 y 20 caracteres: letras, números o guion bajo.");
      return;
    }

    setIsSubmitting(true);
    let createdUser = null;

    try {
      const authEmail = `${usernameLower}@clonx.app`;
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        authEmail,
        password,
      );
      createdUser = credential.user;

      await updateProfile(createdUser, { displayName: fullName });

      const usernameRef = doc(firestoreDb, "usernameIndex", usernameLower);
      const existingUsername = await getDoc(usernameRef);

      if (existingUsername.exists()) {
        throw new Error("USERNAME_TAKEN");
      }

      const emailHash = await hashEmail(email);
      const batch = writeBatch(firestoreDb);

      batch.set(doc(firestoreDb, "users", createdUser.uid), {
        fullName,
        username: usernameLower,
        usernameLower,
        photoURL: "",
        followersCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
      });

      batch.set(doc(firestoreDb, "privateUsers", createdUser.uid), {
        email,
        emailHash,
      });

      batch.set(usernameRef, { uid: createdUser.uid });
      batch.set(doc(firestoreDb, "emailIndex", emailHash), {
        uid: createdUser.uid,
      });

      await batch.commit();
      navigate("/home", { replace: true });
    } catch (registrationError) {
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch {
          // Keep the original registration error for the user.
        }
      }

      setError(registrationErrorMessage(registrationError));
    } finally {
      setIsSubmitting(false);
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
                <h1 className="h3 mb-2">Crear cuenta</h1>
                <p className="text-secondary mb-0">
                  Regístrate para unirte a la conversación.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="fullName">
                    Nombre completo
                  </label>
                  <input
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Escribe tu nombre completo"
                    maxLength={80}
                    required
                  />
                </div>

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
                    placeholder="Por ejemplo, oscar"
                    minLength={3}
                    maxLength={20}
                    pattern="[A-Za-z0-9_]+"
                    required
                  />
                  <div className="form-text">
                    Usa entre 3 y 20 letras, números o guion bajo.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    className="form-control"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@correo.com"
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
                    autoComplete="new-password"
                    placeholder="Crea una contraseña"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando cuenta..." : "Registrarse"}
                </button>
              </form>

              <p className="text-center text-secondary mt-4 mb-0">
                ¿Ya tienes una cuenta?{" "}
                <Link className="text-decoration-none" to="/login">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;