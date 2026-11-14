import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import { firestoreDb } from "../firebase";
import { updateFollowRelationship } from "../data/followService";
import { useAuth } from "./LoginPage";

function RelationshipCard({
  profile,
  isFollowing,
  isSelf,
  isDisabled,
  onToggleFollow,
}) {
  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center gap-3">
        <div>
          <p className="fw-semibold mb-1">{profile.fullName || profile.username}</p>
          <p className="text-secondary mb-0">@{profile.username}</p>
        </div>

        {isSelf ? (
          <span className="badge text-bg-light">Eres tú</span>
        ) : (
          <button
            className={isFollowing ? "btn btn-outline-secondary" : "btn btn-primary"}
            type="button"
            onClick={() => onToggleFollow(profile)}
            disabled={isDisabled}
          >
            {isDisabled
              ? "Guardando..."
              : isFollowing
                ? "Dejar de seguir"
                : "Seguir"}
          </button>
        )}
      </div>
    </article>
  );
}

function FollowingPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [listError, setListError] = useState("");
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);
  const [pendingUserId, setPendingUserId] = useState("");

  useEffect(() => {
    if (!user?.uid || !firestoreDb) {
      return undefined;
    }

    let isActive = true;
    let latestRequest = 0;

    const followingCollection = collection(
      firestoreDb,
      "follows",
      user.uid,
      "following",
    );

    const unsubscribe = onSnapshot(
      followingCollection,
      async (snapshot) => {
        const requestNumber = ++latestRequest;

        try {
          const profiles = await Promise.all(
            snapshot.docs.map(async (followDocument) => {
              const followedId = followDocument.id;
              const profileSnapshot = await getDoc(
                doc(firestoreDb, "users", followedId),
              );

              if (!profileSnapshot.exists()) return null;

              return {
                id: followedId,
                ...profileSnapshot.data(),
              };
            }),
          );

          if (!isActive || requestNumber !== latestRequest) return;

          setFollowingUsers(
            profiles
              .filter(Boolean)
              .sort((firstUser, secondUser) =>
                firstUser.fullName.localeCompare(secondUser.fullName, "es", {
                  sensitivity: "base",
                }),
              ),
          );
          setListError("");
          setIsLoadingFollowing(false);
        } catch {
          if (!isActive || requestNumber !== latestRequest) return;
          setListError("No se pudo cargar la lista de usuarios seguidos.");
          setIsLoadingFollowing(false);
        }
      },
      () => {
        if (!isActive) return;
        setListError("No se pudo conectar con la lista de usuarios seguidos.");
        setIsLoadingFollowing(false);
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user?.uid]);

  const followingIds = new Set(followingUsers.map((profile) => profile.id));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = followingUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const hasConnection = Boolean(user?.uid && firestoreDb);
  const currentListError = hasConnection
    ? listError
    : "No se pudo conectar con Firestore.";
  const loadingFollowing = hasConnection && isLoadingFollowing;

  async function toggleFollow(profile) {
    setFeedback(null);

    if (profile.id === user?.uid) {
      setFeedback({ type: "warning", text: "No puedes seguirte a ti mismo." });
      return;
    }

    if (!firestoreDb || !user?.uid) {
      setFeedback({ type: "danger", text: "Inicia sesión para seguir usuarios." });
      return;
    }

    setPendingUserId(profile.id);
    try {
      const shouldFollow = !followingIds.has(profile.id);
      const changed = await updateFollowRelationship(
        firestoreDb,
        user.uid,
        profile.id,
        shouldFollow,
      );

      if (!changed) {
        return;
      }

      if (!shouldFollow) {
        setFeedback({
          type: "success",
          text: `Dejaste de seguir a @${profile.username}.`,
        });
      } else {
        setFeedback({
          type: "success",
          text: `Ahora sigues a @${profile.username}.`,
        });
      }
    } catch (followError) {
      setFeedback({
        type: "danger",
        text:
          followError.code === "profile-counts-invalid"
            ? "Los contadores de estos perfiles aún no están sincronizados con sus relaciones actuales. Hay que inicializarlos en Firestore antes de cambiar el seguimiento."
            : followError.code === "profile-not-found"
              ? "No encontramos uno de los perfiles en Firestore."
              : followError.code === "permission-denied"
                ? "Firestore no permitió cambiar esta relación. Revisa las reglas publicadas."
                : "No se pudo actualizar el seguimiento. Inténtalo de nuevo.",
      });
    } finally {
      setPendingUserId("");
    }
  }

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Tu comunidad</p>
        <h1 className="h2 mb-1">Usuarios seguidos</h1>
        <p className="text-secondary mb-0">
          {followingUsers.length} personas
        </p>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-3`} role="status">
          {feedback.text}
        </div>
      )}

      <h2 className="h4 mb-3">Personas que sigues</h2>

      {currentListError && (
        <div className="alert alert-danger" role="alert">
          {currentListError}
        </div>
      )}

      {loadingFollowing && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando usuarios seguidos...
        </div>
      )}

      {!loadingFollowing && !currentListError && visibleUsers.length > 0 &&
        visibleUsers.map((profile) => (
          <RelationshipCard
            key={profile.id}
            profile={profile}
            isFollowing
            isSelf={false}
            isDisabled={pendingUserId === profile.id}
            onToggleFollow={toggleFollow}
          />
        ))}

      {!loadingFollowing && !currentListError && followingUsers.length === 0 && (
        <div className="alert alert-light border" role="status">
          Todavía no sigues a ningún usuario. Usa el buscador superior para encontrar cuentas.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={followingUsers.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FollowingPage;
