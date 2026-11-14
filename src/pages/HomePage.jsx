import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router";
import { firestoreDb } from "../firebase";
import TweetCard from "../components/TweetCard";
import { useAuth } from "./LoginPage";

function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentTweets, setRecentTweets] = useState([]);
  const [isLoadingTweets, setIsLoadingTweets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid || !firestoreDb) {
      setIsLoadingTweets(false);
      return undefined;
    }

    const profileRef = doc(firestoreDb, "users", user.uid);
    const profileUnsubscribe = onSnapshot(
      profileRef,
      (profileSnapshot) => {
        setProfile(profileSnapshot.exists() ? profileSnapshot.data() : null);
      },
      () => {
        setError("No se pudo cargar tu perfil.");
      },
    );

    const userTweetsQuery = query(
      collection(firestoreDb, "tweets"),
      where("authorId", "==", user.uid),
    );

    const tweetsUnsubscribe = onSnapshot(
      userTweetsQuery,
      (snapshot) => {
        const tweets = snapshot.docs
          .map((tweetDocument) => {
            const data = tweetDocument.data();

            return {
              id: tweetDocument.id,
              ...data,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(),
            };
          })
          .sort(
            (firstTweet, secondTweet) =>
              new Date(secondTweet.createdAt) - new Date(firstTweet.createdAt),
          )
          .slice(0, 3);

        setRecentTweets(tweets);
        setError("");
        setIsLoadingTweets(false);
      },
      () => {
        setError("No se pudieron cargar tus publicaciones.");
        setIsLoadingTweets(false);
      },
    );

    return () => {
      profileUnsubscribe();
      tweetsUnsubscribe();
    };
  }, [user?.uid]);

  const emailUsername = user?.email?.split("@")[0];
  const fullName =
    profile?.fullName ?? user?.displayName ?? emailUsername ?? "Usuario";
  const username = profile?.username ?? emailUsername ?? "usuario";
  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;

  return (
    <>
      <section className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">
            Tu espacio en Clon de X
          </p>
          <h1 className="h2 mb-1">Hola, {fullName}</h1>
          <p className="text-secondary mb-0">@{username}</p>
        </div>

        <Link className="btn btn-primary" to="/compose">
          Publicar un tweet
        </Link>
      </section>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h6 text-secondary">Seguidores</h2>
              <p className="display-6 fw-bold mb-3">
                {followersCount.toLocaleString("es-CO")}
              </p>
              <Link className="text-decoration-none" to="/followers">
                Ver seguidores
              </Link>
            </div>
          </section>
        </div>

        <div className="col-12 col-md-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h6 text-secondary">Siguiendo</h2>
              <p className="display-6 fw-bold mb-3">
                {followingCount.toLocaleString("es-CO")}
              </p>
              <Link className="text-decoration-none" to="/following">
                Ver usuarios seguidos
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Tus publicaciones recientes</h2>
          <Link className="text-decoration-none" to="/feed">
            Ver feed
          </Link>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {isLoadingTweets && (
          <div className="text-center py-4" role="status">
            <span
              className="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            />
            Cargando tus publicaciones...
          </div>
        )}

        {!isLoadingTweets && !error && recentTweets.length === 0 && (
          <div className="alert alert-light border" role="status">
            Todavía no has publicado. Comparte tu primera idea.
          </div>
        )}

        {recentTweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            user={{
              fullName,
              username: tweet.username ?? username,
            }}
          />
        ))}
      </section>
    </>
  );
}

export default HomePage;