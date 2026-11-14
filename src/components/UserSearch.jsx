import { useEffect, useState } from "react";
import { Link } from "react-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { updateFollowRelationship } from "../data/followService";
import { useAuth } from "../pages/LoginPage";

function UserSearch() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingFollow, setIsSavingFollow] = useState(false);
  const [isLoadingFollowStatus, setIsLoadingFollowStatus] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!user?.uid || !profile?.id || profile.id === user.uid || !firestoreDb) {
      setIsFollowing(false);
      setIsLoadingFollowStatus(false);
      return undefined;
    }

    setIsLoadingFollowStatus(true);
    const relationshipRef = doc(
      firestoreDb,
      "follows",
      user.uid,
      "following",
      profile.id,
    );

    return onSnapshot(
      relationshipRef,
      (snapshot) => {
        setIsFollowing(snapshot.exists());
        setIsLoadingFollowStatus(false);
      },
      () => {
        setIsLoadingFollowStatus(false);
        setFeedback({ type: "danger", text: "No se pudo consultar el seguimiento." });
      },
    );
  }, [profile?.id, user?.uid]);

  async function handleSearch(event) {
    event.preventDefault();
    setFeedback(null);
    setProfile(null);

    const usernameLower = searchTerm.trim().replace(/^@/, "").toLowerCase();
    if (!usernameLower) {
      setFeedback({ type: "warning", text: "Escribe un nombre de usuario para buscar." });
      return;
    }
    if (!user?.uid || !firestoreDb) {
      setFeedback({ type: "danger", text: "Inicia sesión para buscar usuarios." });
      return;
    }

    setIsSearching(true);
    try {
      const usernameSnapshot = await getDoc(
        doc(firestoreDb, "usernameIndex", usernameLower),
      );
      if (!usernameSnapshot.exists()) {
        setFeedback({ type: "warning", text: "No encontramos ese usuario." });
        return;
      }

      const userId = usernameSnapshot.data().uid;
      const profileSnapshot = await getDoc(doc(firestoreDb, "users", userId));
      if (!profileSnapshot.exists()) {
        setFeedback({ type: "warning", text: "Ese perfil no está disponible." });
        return;
      }

      setProfile({ id: userId, ...profileSnapshot.data() });
    } catch (error) {
      setFeedback({
        type: "danger",
        text: error.code === "permission-denied"
          ? "Firestore no permitió buscar ese usuario. Revisa las reglas publicadas."
          : "No se pudo completar la búsqueda. Inténtalo de nuevo.",
      });
    } finally {
      setIsSearching(false);
    }
  }

  async function handleToggleFollow() {
    if (!profile || profile.id === user?.uid || isSavingFollow || isLoadingFollowStatus) return;

    setIsSavingFollow(true);
    setFeedback(null);
    try {
      const shouldFollow = !isFollowing;
      const changed = await updateFollowRelationship(
        firestoreDb,
        user.uid,
        profile.id,
        shouldFollow,
      );
      if (changed) {
        setFeedback({
          type: "success",
          text: shouldFollow
            ? `Ahora sigues a @${profile.username}.`
            : `Dejaste de seguir a @${profile.username}.`,
        });
      }
    } catch (error) {
      setFeedback({
        type: "danger",
        text: error.code === "profile-counts-invalid"
          ? "Los contadores de este perfil deben sincronizarse en Firestore antes de cambiar el seguimiento."
          : error.code === "profile-not-found"
            ? "No se encontró uno de los perfiles en Firestore."
          : error.code === "permission-denied"
            ? "Firestore no permitió cambiar el seguimiento. Revisa las reglas publicadas."
            : "No se pudo actualizar el seguimiento. Inténtalo de nuevo.",
      });
    } finally {
      setIsSavingFollow(false);
    }
  }

  return (
    <div className="user-search position-relative flex-grow-1">
      <form className="d-flex gap-2" role="search" onSubmit={handleSearch}>
        <label className="visually-hidden" htmlFor="globalUsernameSearch">
          Buscar usuario por nombre
        </label>
        <input
          className="form-control form-control-sm"
          id="globalUsernameSearch"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar usuario"
          maxLength={21}
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {(profile || feedback) && (
        <div className="user-search-results card border-0 shadow mt-2">
          {profile && (
            <div className="card-body d-flex justify-content-between align-items-center gap-3 py-3">
              <div className="text-truncate">
                <p className="fw-semibold text-truncate mb-1">
                  <Link
                    className="text-body text-decoration-none"
                    to={`/users/${profile.username}`}
                  >
                    {profile.fullName || profile.username}
                  </Link>
                </p>
                <p className="text-secondary text-truncate mb-0">@{profile.username}</p>
              </div>
              {profile.id === user?.uid ? (
                <span className="badge text-bg-light flex-shrink-0">Eres tú</span>
              ) : (
                <button
                  className={isFollowing ? "btn btn-outline-secondary btn-sm" : "btn btn-primary btn-sm"}
                  type="button"
                  disabled={isSavingFollow || isLoadingFollowStatus}
                  onClick={handleToggleFollow}
                >
                  {isSavingFollow
                    ? "Guardando..."
                    : isLoadingFollowStatus
                      ? "Consultando..."
                      : isFollowing
                        ? "Dejar de seguir"
                        : "Seguir"}
                </button>
              )}
            </div>
          )}
          {feedback && (
            <div className={`alert alert-${feedback.type} m-2`} role="status">
              {feedback.text}
            </div>
          )}
          <button
            className="btn btn-link btn-sm text-secondary text-decoration-none"
            type="button"
            onClick={() => { setProfile(null); setFeedback(null); }}
          >
            Cerrar resultado
          </button>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
