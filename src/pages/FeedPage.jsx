import { useState } from "react";
import { currentUserId, followingIds, tweets, users } from "../data/mockData";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import TweetCard from "../components/TweetCard";

function FeedPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const feedTweets = tweets
    .filter(
      (tweet) =>
        tweet.userId === currentUserId || followingIds.includes(tweet.userId),
    )
    .sort(
      (firstTweet, secondTweet) =>
        new Date(secondTweet.createdAt) - new Date(firstTweet.createdAt),
    );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTweets = feedTweets.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Lo último de tu comunidad</p>
        <h1 className="h2 mb-0">Feed</h1>
      </div>

      {visibleTweets.length > 0 ? (
        visibleTweets.map((tweet) => {
          const author = users.find((user) => user.id === tweet.userId);

          return <TweetCard key={tweet.id} tweet={tweet} user={author} />;
        })
      ) : (
        <div className="alert alert-light border" role="status">
          Todavía no hay publicaciones para mostrar.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={feedTweets.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FeedPage;