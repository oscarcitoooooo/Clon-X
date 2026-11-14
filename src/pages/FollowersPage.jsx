import { useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import UserCard from "../components/UserCard";
import { firestoreDb } from "../firebase";
import { updateFollowRelationship } from "../data/followService";
import { useAuth } from "./LoginPage";

function FollowersPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [indexUrl, setIndexUrl] = useState("");
  const [followingIds, setFollowingIds] = useState([]);
  const [pendingUserId, setPendingUserId] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const connectionError = !user?.uid || !firestoreDb
    ? "No se pudo conectar con Firestore."
    : "";

  useEffect(() => {
    if (!user?.uid || !firestoreDb) return undefined;

    let isActive = true;
    let latestRequest = 0;

    const followersQuery = query(
      collectionGroup(firestoreDb, "following"),
      where("followedId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      followersQuery,
      async (snapshot) => {
        const requestNumber = ++latestRequest;

        try {
          const profiles = await Promise.all(
            snapshot.docs.map(async (followDocument) => {
              const followerId = followDocument.data().followerId;
              if (!followerId) return null;

              const profileSnapshot = await getDoc(
                doc(firestoreDb, "users", followerId),
              );
              if (!profileSnapshot.exists()) return null;

              return { id: followerId, ...profileSnapshot.data() };
            }),
          );

          if (!isActive || requestNumber !== latestRequest) return;

          setFollowerUsers(
            profiles
              .filter(Boolean)
              .sort((firstUser, secondUser) =>
                (firstUser.fullName || firstUser.username).localeCompare(
                  secondUser.fullName || secondUser.username,
                  "es",
                  { sensitivity: "base" },
                ),
              ),
          );
          setCurrentPage(1);
          setError("");
          setIsLoading(false);
        } catch {
          if (!isActive || requestNumber !== latestRequest) return;
          setError("No se pudieron cargar tus seguidores.");
          setIsLoading(false);
        }
      },
      (snapshotError) => {
        if (!isActive) return;
        const indexLink = snapshotError.message
          ?.match(/https:\/\/console\.firebase\.google\.com\/[^\s]+/)?.[0]
          ?.replace(/[),.;]+$/, "");
        if (snapshotError.code === "failed-precondition" && indexLink) {
          setIndexUrl(indexLink);
        }
        setError(
          snapshotError.code === "permission-denied"
            ? "Firestore no permitió consultar tus seguidores. Publica las reglas actualizadas."
            : snapshotError.code === "failed-precondition"
              ? "Firestore requiere un índice para esta consulta (failed-precondition)."
              : `No se pudo conectar con la lista de seguidores (código: ${snapshotError.code || "desconocido"}).`,
        );
        setIsLoading(false);
      },
    );

    const followingUnsubscribe = onSnapshot(
      collection(firestoreDb, "follows", user.uid, "following"),
      (snapshot) => {
        if (isActive) setFollowingIds(snapshot.docs.map((item) => item.id));
      },
      () => {
        if (isActive) setError("No se pudo consultar a quién sigues.");
      },
    );

    return () => {
      isActive = false;
      unsubscribe();
      followingUnsubscribe();
    };
  }, [user?.uid]);

  const maxPage = Math.max(1, Math.ceil(followerUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, maxPage);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleUsers = followerUsers.slice(startIndex, startIndex + PAGE_SIZE);
  const displayError = connectionError || error;
  const displayLoading = !connectionError && isLoading;

  async function toggleFollow(profile) {
    if (!user?.uid || !firestoreDb || pendingUserId) return;
    setPendingUserId(profile.id);
    setActionMessage(null);
    const shouldFollow = !followingIds.includes(profile.id);
    try {
      await updateFollowRelationship(firestoreDb, user.uid, profile.id, shouldFollow);
      setActionMessage({
        type: "success",
        text: shouldFollow
          ? `Ahora sigues a @${profile.username}.`
          : `Dejaste de seguir a @${profile.username}.`,
      });
    } catch (followError) {
      setActionMessage({
        type: "danger",
        text: followError.code === "profile-counts-invalid"
          ? "Los contadores de estos perfiles deben coincidir con sus relaciones antes de cambiar el seguimiento."
          : followError.code === "permission-denied"
            ? "Firestore no permitió cambiar el seguimiento. Revisa las reglas publicadas."
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
        <h1 className="h2 mb-1">Seguidores</h1>
      <p className="text-secondary mb-0">{followerUsers.length} personas</p>
      </div>

      {displayLoading && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando seguidores...
        </div>
      )}

      {displayError && (
        <div className="alert alert-danger" role="alert">
          {displayError}
          {indexUrl && (
            <div className="mt-2">
              <a href={indexUrl} target="_blank" rel="noreferrer">
                Crear el índice requerido en Firebase
              </a>
            </div>
          )}
        </div>
      )}

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type}`} role="status">
          {actionMessage.text}
        </div>
      )}

      {!displayLoading && !displayError && visibleUsers.length > 0 &&
        visibleUsers.map((follower) => (
          <UserCard
            key={follower.id}
            user={follower}
            showFollowButton={follower.id !== user?.uid}
            isFollowing={followingIds.includes(follower.id)}
            isDisabled={displayLoading || pendingUserId === follower.id}
            onToggleFollow={toggleFollow}
          />
        ))}

      {!displayLoading && !displayError && followerUsers.length === 0 && (
        <div className="alert alert-light border" role="status">
          Todavía no tienes seguidores.
        </div>
      )}

      <Pagination
        currentPage={safeCurrentPage}
        totalItems={followerUsers.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FollowersPage;
