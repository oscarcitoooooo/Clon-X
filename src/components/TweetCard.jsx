import { useState } from "react";
import { Link } from "react-router";
import { deleteDoc, doc } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { useAuth } from "../pages/LoginPage";

function TweetCard({ tweet, user }) {
  const { user: signedInUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const fullName = user?.fullName ?? "Usuario desconocido";
  const username = user?.username ?? "usuario";
  const createdAt = tweet.createdAt?.toDate
    ? tweet.createdAt.toDate()
    : new Date(tweet.createdAt);
  const publishedAt = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt);
  const canDelete = signedInUser?.uid === tweet.authorId && Boolean(firestoreDb);

  async function handleDelete() {
    if (!canDelete || isDeleting) return;

    const confirmed = window.confirm("¿Seguro que quieres eliminar este tweet?");
    if (!confirmed) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteDoc(doc(firestoreDb, "tweets", tweet.id));
    } catch (error) {
      setDeleteError(
        error.code === "permission-denied"
          ? "No tienes permiso para eliminar este tweet."
          : "No se pudo eliminar el tweet. Inténtalo de nuevo.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <p className="fw-semibold mb-2">
            <Link
              className="text-body text-decoration-none"
              to={`/users/${username}`}
            >
              {fullName}
            </Link>
            {", "}
            <span className="text-secondary">@{username}</span>
            <span className="text-secondary"> - {publishedAt}</span>
          </p>

          {canDelete && (
            <button
              className="btn btn-outline-danger btn-sm flex-shrink-0"
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`Eliminar tweet de @${username}`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          )}
        </div>

        <p className="mb-0 text-break">{tweet.content}</p>

        {deleteError && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {deleteError}
          </div>
        )}
      </div>
    </article>
  );
}

export default TweetCard;
