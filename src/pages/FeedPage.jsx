import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import TweetCard from "../components/TweetCard";
import { firestoreDb } from "../firebase";

function FeedPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [feedTweets, setFeedTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firestoreDb) {
      setError("Firebase no está configurado.");
      setIsLoading(false);
      return undefined;
    }

    let latestRequest = 0;

    const tweetsQuery = query(
      collection(firestoreDb, "tweets"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      tweetsQuery,
      async (snapshot) => {
        const requestNumber = ++latestRequest;

        try {
          const documents = snapshot.docs.map((tweetDocument) => ({
            id: tweetDocument.id,
            ...tweetDocument.data(),
          }));

          const authorIds = [
            ...new Set(documents.map((tweet) => tweet.authorId).filter(Boolean)),
          ];

          const profileEntries = await Promise.all(
            authorIds.map(async (authorId) => {
              const profileSnapshot = await getDoc(
                doc(firestoreDb, "users", authorId),
              );

              return [
                authorId,
                profileSnapshot.exists() ? profileSnapshot.data() : null,
              ];
            }),
          );

          if (requestNumber !== latestRequest) return;

          const profiles = new Map(profileEntries);

          setFeedTweets(
            documents.map((tweet) => ({
              tweet: {
                ...tweet,
                createdAt: tweet.createdAt?.toDate
                  ? tweet.createdAt.toDate()
                  : new Date(),
              },
              user: profiles.get(tweet.authorId) ?? {
                fullName: tweet.username,
                username: tweet.username,
              },
            })),
          );
          setError("");
          setIsLoading(false);
        } catch {
          if (requestNumber !== latestRequest) return;
          setError("No se pudieron cargar las publicaciones.");
          setIsLoading(false);
        }
      },
      () => {
        setError("No se pudo conectar con el feed de Firestore.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTweets = feedTweets.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">
          Lo último de tu comunidad
        </p>
        <h1 className="h2 mb-0">Feed</h1>
      </div>

      {isLoading && (
        <div className="text-center py-4" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando publicaciones...
        </div>
      )}

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!isLoading && !error && feedTweets.length === 0 && (
        <div className="alert alert-light border" role="status">
          Todavía no hay publicaciones. ¡Sé el primero en compartir una idea!
        </div>
      )}

      {visibleTweets.map(({ tweet, user }) => (
        <TweetCard key={tweet.id} tweet={tweet} user={user} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalItems={feedTweets.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FeedPage;