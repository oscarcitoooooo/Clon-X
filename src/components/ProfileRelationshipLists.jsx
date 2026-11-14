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
import Pagination, { PAGE_SIZE } from "./Pagination";
import UserCard from "./UserCard";
import { firestoreDb } from "../firebase";
import { updateFollowRelationship } from "../data/followService";

function sortByFullName(profiles) {
  return profiles.sort((first, second) =>
    (first.fullName || first.username || "").localeCompare(
      second.fullName || second.username || "",
      "es",
      { sensitivity: "base" },
    ),
  );
}

function ProfileRelationshipLists({ profileId, signedInUserId }) {
  const [activeList, setActiveList] = useState("followers");
  const [currentPage, setCurrentPage] = useState(1);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [myFollowingIds, setMyFollowingIds] = useState([]);
  const [loading, setLoading] = useState({ followers: true, following: true });
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [pendingUserId, setPendingUserId] = useState("");

  useEffect(() => {
    if (!profileId || !firestoreDb) return undefined;
    let active = true;
    let followersRequest = 0;
    let followingRequest = 0;
    const loadProfiles = async (relationships, idField, requestNumber, isLatest) => {
      const profiles = await Promise.all(relationships.docs.map(async (relationship) => {
        const userId = relationship.data()[idField] || relationship.id;
        if (!userId) return null;
        const profileSnapshot = await getDoc(doc(firestoreDb, "users", userId));
        return profileSnapshot.exists()
          ? { id: userId, ...profileSnapshot.data() }
          : null;
      }));
      if (!active || !isLatest()) return;
      const sorted = sortByFullName(profiles.filter(Boolean));
      if (idField === "followedId") setFollowing(sorted);
      else setFollowers(sorted);
      setLoading((current) => ({ ...current, [idField === "followedId" ? "following" : "followers"]: false }));
      setCurrentPage(1);
    };

    const followersQuery = query(
      collectionGroup(firestoreDb, "following"),
      where("followedId", "==", profileId),
    );
    const followersUnsubscribe = onSnapshot(
      followersQuery,
      (snapshot) => {
        const requestNumber = ++followersRequest;
        loadProfiles(snapshot, "followerId", requestNumber, () => followersRequest === requestNumber)
          .catch(() => { if (active) { setError("No se pudieron cargar los seguidores del perfil."); setLoading((current) => ({ ...current, followers: false })); } });
      },
      () => { if (active) { setError("No se pudo consultar la lista de seguidores. Revisa las reglas publicadas."); setLoading((current) => ({ ...current, followers: false })); } },
    );

    const followingUnsubscribe = onSnapshot(
      collection(firestoreDb, "follows", profileId, "following"),
      (snapshot) => {
        const requestNumber = ++followingRequest;
        loadProfiles(snapshot, "followedId", requestNumber, () => followingRequest === requestNumber)
          .catch(() => { if (active) { setError("No se pudieron cargar los usuarios seguidos del perfil."); setLoading((current) => ({ ...current, following: false })); } });
      },
      () => { if (active) { setError("No se pudo consultar la lista de seguidos. Revisa las reglas publicadas."); setLoading((current) => ({ ...current, following: false })); } },
    );

    let myFollowingUnsubscribe = () => {};
    if (signedInUserId) {
      myFollowingUnsubscribe = onSnapshot(
        collection(firestoreDb, "follows", signedInUserId, "following"),
        (snapshot) => { if (active) setMyFollowingIds(snapshot.docs.map((item) => item.id)); },
        () => { if (active) setError("No se pudo consultar tu estado de seguimiento."); },
      );
    }

    return () => {
      active = false;
      followersUnsubscribe();
      followingUnsubscribe();
      myFollowingUnsubscribe();
    };
  }, [profileId, signedInUserId]);

  const profiles = activeList === "followers" ? followers : following;
  const isLoading = loading[activeList];
  const maxPage = Math.max(1, Math.ceil(profiles.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, maxPage);
  const visibleProfiles = profiles.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  async function toggleFollow(profile) {
    if (!signedInUserId || !firestoreDb || pendingUserId) return;
    const shouldFollow = !myFollowingIds.includes(profile.id);
    setPendingUserId(profile.id);
    setActionMessage(null);
    try {
      await updateFollowRelationship(firestoreDb, signedInUserId, profile.id, shouldFollow);
      setActionMessage({
        type: "success",
        text: shouldFollow ? `Ahora sigues a @${profile.username}.` : `Dejaste de seguir a @${profile.username}.`,
      });
    } catch (followError) {
      setActionMessage({
        type: "danger",
        text: followError.code === "profile-counts-invalid"
          ? "Los contadores deben estar inicializados con las relaciones existentes antes de cambiar el seguimiento."
          : followError.code === "permission-denied"
            ? "Firestore no permitió cambiar el seguimiento. Revisa las reglas publicadas."
            : "No se pudo actualizar el seguimiento. Inténtalo de nuevo.",
      });
    } finally {
      setPendingUserId("");
    }
  }

  return (
    <section className="mb-4" aria-labelledby="profile-network-title">
      <h2 className="h5 mb-3" id="profile-network-title">Comunidad</h2>
      <div className="nav nav-tabs mb-3" role="tablist" aria-label="Listas del perfil">
        <button className={`nav-link ${activeList === "followers" ? "active" : ""}`} type="button" role="tab" aria-selected={activeList === "followers"} onClick={() => { setActiveList("followers"); setCurrentPage(1); }}>
          Seguidores ({followers.length})
        </button>
        <button className={`nav-link ${activeList === "following" ? "active" : ""}`} type="button" role="tab" aria-selected={activeList === "following"} onClick={() => { setActiveList("following"); setCurrentPage(1); }}>
          Siguiendo ({following.length})
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {actionMessage && <div className={`alert alert-${actionMessage.type}`} role="status">{actionMessage.text}</div>}
      {isLoading && (
        <div className="text-center py-3" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando {activeList === "followers" ? "seguidores" : "usuarios seguidos"}...
        </div>
      )}
      {!isLoading && !error && profiles.length === 0 && (
        <div className="alert alert-light border" role="status">
          {activeList === "followers" ? "Este usuario todavía no tiene seguidores." : "Este usuario todavía no sigue a nadie."}
        </div>
      )}
      {!isLoading && !error && visibleProfiles.map((profile) => (
        <UserCard
          key={profile.id}
          user={profile}
          showFollowButton={profile.id !== signedInUserId}
          isFollowing={myFollowingIds.includes(profile.id)}
          isDisabled={pendingUserId === profile.id}
          onToggleFollow={toggleFollow}
        />
      ))}
      <Pagination currentPage={safeCurrentPage} totalItems={profiles.length} onPageChange={setCurrentPage} />
    </section>
  );
}

export default ProfileRelationshipLists;
