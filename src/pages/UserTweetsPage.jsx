import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import TweetCard from "../components/TweetCard";
import { firestoreDb } from "../firebase";
import { useAuth } from "./LoginPage";

function UserTweetsPage() {
  const { username = "" } = useParams();
  const { user: signedInUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState("loading");
  const [profileError, setProfileError] = useState("");
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [userTweets, setUserTweets] = useState([]);
  const [tweetsStatus, setTweetsStatus] = useState("loading");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!firestoreDb) {
      setProfileStatus("error");
      setProfileError("Firebase no está configurado.");
      return undefined;
    }

    let isActive = true;
    let unsubscribeTweets;
    let unsubscribeFollow;
    let unsubscribeFollowing;
    let unsubscribeFollowers;
    setProfile(null);
    setFollowersCount(null);
    setFollowingCount(null);
    setUserTweets([]);
    setIsFollowing(false);
    setCurrentPage(1);
    setProfileStatus("loading");
    setTweetsStatus("loading");
    setProfileError("");
    setFollowStatus("");
    setIsFollowLoading(false);

    async function loadProfile() {
      try {
        const usernameLower = username.trim().replace(/^@/, "").toLowerCase();
        const usernameSnapshot = await getDoc(
          doc(firestoreDb, "usernameIndex", usernameLower),
        );

        if (!isActive) return;
        if (!usernameSnapshot.exists()) {
          setProfileStatus("not-found");
          setTweetsStatus("ready");
          return;
        }

        const userId = usernameSnapshot.data().uid;
        const profileSnapshot = await getDoc(doc(firestoreDb, "users", userId));

        if (!isActive) return;
        if (!profileSnapshot.exists()) {
          setProfileStatus("not-found");
          setTweetsStatus("ready");
          return;
        }

        const loadedProfile = { id: userId, ...profileSnapshot.data() };
        setProfile(loadedProfile);
        setProfileStatus("ready");

        const profileFollowingQuery = collection(
          firestoreDb,
          "follows",
          userId,
          "following",
        );
        unsubscribeFollowing = onSnapshot(
          profileFollowingQuery,
          (snapshot) => {
            if (isActive) {
              setFollowingCount(snapshot.size);
            }
          },
          () => {
            if (isActive) {
              setFollowStatus("No se pudo actualizar el contador de usuarios seguidos.");
            }
          },
        );

        const profileFollowersQuery = query(
          collectionGroup(firestoreDb, "following"),
          where("followedId", "==", userId),
        );
        unsubscribeFollowers = onSnapshot(
          profileFollowersQuery,
          (snapshot) => {
            if (isActive) {
              setFollowersCount(snapshot.size);
            }
          },
          () => {
            if (isActive) {
              setFollowStatus("No se pudo actualizar el contador de seguidores.");
            }
          },
        );

        const tweetsQuery = query(
          collection(firestoreDb, "tweets"),
          where("authorId", "==", userId),
        );

        unsubscribeTweets = onSnapshot(
          tweetsQuery,
          (snapshot) => {
            if (!isActive) return;
            const sortedTweets = snapshot.docs
              .map((tweetDocument) => ({
                id: tweetDocument.id,
                ...tweetDocument.data(),
              }))
              .sort((firstTweet, secondTweet) => {
                const firstDate = firstTweet.createdAt?.toDate
                  ? firstTweet.createdAt.toDate()
                  : new Date(firstTweet.createdAt || 0);
                const secondDate = secondTweet.createdAt?.toDate
                  ? secondTweet.createdAt.toDate()
                  : new Date(secondTweet.createdAt || 0);
                return secondDate - firstDate;
              });

            setUserTweets(sortedTweets);
            setTweetsStatus("ready");
          },
          () => {
            if (!isActive) return;
            setTweetsStatus("error");
          },
        );

        if (signedInUser?.uid && signedInUser.uid !== userId) {
          const followRef = doc(
            firestoreDb,
            "follows",
            signedInUser.uid,
            "following",
            userId,
          );
          unsubscribeFollow = onSnapshot(
            followRef,
            (followSnapshot) => {
              if (isActive) setIsFollowing(followSnapshot.exists());
            },
            () => {
              if (isActive) {
                setFollowStatus("No se pudo consultar el estado de seguimiento.");
              }
            },
          );
        } else {
          setIsFollowing(false);
        }
      } catch (error) {
        if (!isActive) return;
        setProfileStatus("error");
        setProfileError(
          error.code === "permission-denied"
            ? "Firestore no permitió cargar este perfil. Revisa las reglas publicadas."
            : "No se pudo cargar el perfil. Inténtalo de nuevo.",
        );
        setTweetsStatus("error");
      }
    }

    loadProfile();

    return () => {
      isActive = false;
      unsubscribeTweets?.();
      unsubscribeFollow?.();
      unsubscribeFollowing?.();
      unsubscribeFollowers?.();
    };
  }, [username, signedInUser?.uid]);

  async function toggleFollow() {
    if (!profile || !signedInUser?.uid || !firestoreDb || isFollowLoading) return;

    setIsFollowLoading(true);
    setFollowStatus("");
    const followRef = doc(
      firestoreDb,
      "follows",
      signedInUser.uid,
      "following",
      profile.id,
    );

    try {
      if (isFollowing) {
        await deleteDoc(followRef);
      } else {
        await setDoc(followRef, {
          followerId: signedInUser.uid,
          followedId: profile.id,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      setFollowStatus(
        error.code === "permission-denied"
          ? "Firestore no permitió cambiar el seguimiento. Revisa las reglas publicadas."
          : "No se pudo actualizar el seguimiento. Inténtalo de nuevo.",
      );
    } finally {
      setIsFollowLoading(false);
    }
  }

  const isSelf = profile?.id === signedInUser?.uid;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTweets = userTweets.slice(startIndex, startIndex + PAGE_SIZE);

  if (profileStatus === "loading") {
    return (
      <div className="text-center py-5" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Cargando perfil...
      </div>
    );
  }

  if (profileStatus === "not-found") {
    return (
      <div className="alert alert-warning" role="alert">
        No encontramos ese usuario. <Link to="/feed">Volver al feed</Link>
      </div>
    );
  }

  if (profileStatus === "error") {
    return (
      <div className="alert alert-danger" role="alert">
        {profileError} <Link to="/feed">Volver al feed</Link>
      </div>
    );
  }

  return (
    <section>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1">{profile.fullName || profile.username}</h1>
              <p className="text-secondary mb-3">@{profile.username}</p>
              <div className="d-flex flex-wrap gap-4">
                <span><strong>{followersCount === null ? "…" : followersCount}</strong> seguidores</span>
                <span><strong>{followingCount === null ? "…" : followingCount}</strong> siguiendo</span>
              </div>
            </div>

            {!isSelf && signedInUser && (
              <button
                className={`btn align-self-sm-start ${isFollowing ? "btn-outline-primary" : "btn-primary"}`}
                type="button"
                onClick={toggleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading
                  ? "Guardando..."
                  : isFollowing
                    ? "Dejar de seguir"
                    : "Seguir"}
              </button>
            )}
          </div>
          {followStatus && <div className="alert alert-danger mt-3 mb-0" role="alert">{followStatus}</div>}
        </div>
      </div>

      <h2 className="h5 mb-3">Publicaciones</h2>

      {tweetsStatus === "loading" && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando publicaciones...
        </div>
      )}

      {tweetsStatus === "error" && (
        <div className="alert alert-danger" role="alert">
          No se pudieron cargar las publicaciones de este usuario.
        </div>
      )}

      {tweetsStatus === "ready" && userTweets.length === 0 && (
        <div className="alert alert-light border" role="status">
          Este usuario todavía no tiene publicaciones.
        </div>
      )}

      {tweetsStatus === "ready" && visibleTweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} user={profile} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalItems={userTweets.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default UserTweetsPage;
