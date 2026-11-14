import { useEffect, useMemo, useState } from "react";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import TweetCard from "../components/TweetCard";
import { firestoreDb } from "../firebase";
import { useAuth } from "./LoginPage";

function FeedPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [tweets, setTweets] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [followerIds, setFollowerIds] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const connectionError = !user?.uid || !firestoreDb
    ? "Inicia sesión para cargar el feed."
    : "";

  useEffect(() => {
    if (!user?.uid || !firestoreDb) return undefined;

    let active = true;
    let readyCount = 0;
    const markReady = () => {
      readyCount += 1;
      if (readyCount >= 3 && active) setIsLoading(false);
    };
    const handleError = () => {
      if (!active) return;
      setError("No se pudo cargar el feed y tus relaciones. Revisa la conexión y las reglas de Firestore.");
      setIsLoading(false);
    };

    const followingUnsubscribe = onSnapshot(
      collection(firestoreDb, "follows", user.uid, "following"),
      (snapshot) => {
        if (!active) return;
        setFollowingIds(snapshot.docs.map((relationship) => relationship.id));
        markReady();
      },
      handleError,
    );

    const followersUnsubscribe = onSnapshot(
      query(
        collectionGroup(firestoreDb, "following"),
        where("followedId", "==", user.uid),
      ),
      (snapshot) => {
        if (!active) return;
        setFollowerIds(
          snapshot.docs
            .map((relationship) => relationship.data().followerId)
            .filter(Boolean),
        );
        markReady();
      },
      handleError,
    );

    const tweetsUnsubscribe = onSnapshot(
      query(collection(firestoreDb, "tweets"), orderBy("createdAt", "desc")),
      (snapshot) => {
        if (!active) return;
        setTweets(snapshot.docs.map((tweetDocument) => ({
          id: tweetDocument.id,
          ...tweetDocument.data(),
        })));
        markReady();
      },
      handleError,
    );

    return () => {
      active = false;
      followingUnsubscribe();
      followersUnsubscribe();
      tweetsUnsubscribe();
    };
  }, [user?.uid]);

  const authorIds = useMemo(
    () => new Set([user?.uid, ...followingIds, ...followerIds].filter(Boolean)),
    [user?.uid, followingIds, followerIds],
  );
  const feedTweets = useMemo(
    () => tweets.filter((tweet) => authorIds.has(tweet.authorId)),
    [tweets, authorIds],
  );

  useEffect(() => {
    if (!firestoreDb || feedTweets.length === 0) return undefined;
    let active = true;
    const authorsToLoad = [...new Set(feedTweets.map((tweet) => tweet.authorId))]
      .filter((authorId) => authorId && !Object.hasOwn(profiles, authorId));
    if (authorsToLoad.length === 0) return undefined;

    Promise.all(authorsToLoad.map(async (authorId) => {
      const profileSnapshot = await getDoc(doc(firestoreDb, "users", authorId));
      return [authorId, profileSnapshot.exists() ? profileSnapshot.data() : null];
    }))
      .then((entries) => {
        if (active) {
          setProfiles((current) => ({
            ...current,
            ...Object.fromEntries(entries),
          }));
        }
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar los perfiles del feed.");
      });

    return () => { active = false; };
  }, [feedTweets, profiles]);

  const maxPage = Math.max(1, Math.ceil(feedTweets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, maxPage);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleTweets = feedTweets.slice(startIndex, startIndex + PAGE_SIZE);
  const displayError = connectionError || error;
  const displayLoading = !connectionError && isLoading;

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Lo último de tu comunidad</p>
        <h1 className="h2 mb-0">Feed</h1>
      </div>

      {displayLoading && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando publicaciones...
        </div>
      )}
      {displayError && <div className="alert alert-danger" role="alert">{displayError}</div>}
      {!displayLoading && !displayError && feedTweets.length === 0 && (
        <div className="alert alert-light border" role="status">
          Todavía no hay publicaciones de las cuentas que sigues, te siguen o son tuyas.
        </div>
      )}

      {visibleTweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={{
            ...tweet,
            createdAt: tweet.createdAt?.toDate ? tweet.createdAt.toDate() : new Date(),
          }}
          user={profiles[tweet.authorId] ?? {
            fullName: tweet.username,
            username: tweet.username,
          }}
        />
      ))}

      <Pagination
        currentPage={safeCurrentPage}
        totalItems={feedTweets.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FeedPage;
