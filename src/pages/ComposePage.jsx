import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Link } from "react-router";
import { useAuth } from "./LoginPage";
import { firestoreDb } from "../firebase";

function ComposePage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Escribe un mensaje antes de publicar.");
      return;
    }

    if (trimmedContent.length > 280) {
      setError("El mensaje no puede superar los 280 caracteres.");
      return;
    }

    if (!user || !firestoreDb) {
      setError("No se pudo conectar con Firebase. Inicia sesión e inténtalo de nuevo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profileRef = doc(firestoreDb, "users", user.uid);
      const profileSnapshot = await getDoc(profileRef);

      if (!profileSnapshot.exists()) {
        setError("No encontramos tu perfil en Firestore. Pide ayuda al equipo antes de publicar.");
        return;
      }

      const profile = profileSnapshot.data();

      await addDoc(collection(firestoreDb, "tweets"), {
        content: trimmedContent,
        authorId: user.uid,
        username: profile.username,
        createdAt: serverTimestamp(),
      });

      setContent("");
      setSuccess("¡Publicación guardada! Ya puedes verla en el feed.");
    } catch (publishError) {
      setError(
        publishError.code === "permission-denied"
          ? "Firebase no permitió guardar la publicación. Revisa las reglas de Firestore."
          : "No se pudo publicar. Comprueba tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <section className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <div className="mb-4">
              <p className="text-primary fw-semibold mb-1">Nueva publicación</p>
              <h1 className="h3 mb-2">¿Qué está pasando?</h1>
              <p className="text-secondary mb-0">
                Comparte una idea con tu comunidad.
              </p>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && (
              <div className="alert alert-success" role="status">
                {success}{" "}
                <Link to="/feed" className="alert-link">Ir al feed</Link>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="tweetContent">
                  Mensaje
                </label>
                <textarea
                  className="form-control"
                  id="tweetContent"
                  name="content"
                  rows="5"
                  placeholder="Escribe tu publicación..."
                  maxLength={280}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <div className="form-text text-end">
                  {content.length}/280
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <Link className="btn btn-link text-decoration-none px-0" to="/home">
                  Cancelar
                </Link>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ComposePage;