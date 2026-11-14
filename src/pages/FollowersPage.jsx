import { useEffect, useState } from "react";
import {
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
import { useAuth } from "./LoginPage";

function FollowersPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [indexUrl, setIndexUrl] = useState("");

  useEffect(() => {
    if (!user?.uid || !firestoreDb) {
      setError("No se pudo conectar con Firestore.");
      setIsLoading(false);
      return undefined;
    }

    let isActive = true;
    let latestRequest = 0;
    setFollowerUsers([]);
    setCurrentPage(1);
    setIsLoading(true);
    setError("");
    setIndexUrl("");

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

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user?.uid]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = followerUsers.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Tu comunidad</p>
        <h1 className="h2 mb-1">Seguidores</h1>
        <p className="text-secondary mb-0">{followerUsers.length} personas</p>
      </div>

      {isLoading && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando seguidores...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          {indexUrl && (
            <div className="mt-2">
              <a href={indexUrl} target="_blank" rel="noreferrer">
                Crear el índice requerido en Firebase
              </a>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && visibleUsers.length > 0 &&
        visibleUsers.map((follower) => <UserCard key={follower.id} user={follower} />)}

      {!isLoading && !error && followerUsers.length === 0 && (
        <div className="alert alert-light border" role="status">
          Todavía no tienes seguidores.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={followerUsers.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FollowersPage;
