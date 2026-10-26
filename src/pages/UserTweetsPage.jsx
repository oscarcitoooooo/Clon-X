import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  currentUserId,
  followingIds,
  tweets,
  users,
} from "../data/mockData";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import TweetCard from "../components/TweetCard";

function UserTweetsPage() {
  const { username } = useParams();
  const [currentPage, setCurrentPage] = useState(1);

  const user = users.find((item) => item.username === username);

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        No encontramos ese usuario. <Link to="/feed">Volver al feed</Link>
      </div>
    );
  }

  const userTweets = tweets
    .filter((tweet) => tweet.userId === user.id)
    .sort(
      (firstTweet, secondTweet) =>
        new Date(secondTweet.createdAt) - new Date(firstTweet.createdAt),
    );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTweets = userTweets.slice(startIndex, startIndex + PAGE_SIZE);
  const isFollowing = followingIds.includes(user.id);

  return (
    <section>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1">{user.fullName}</h1>
              <p className="text-secondary mb-3">@{user.username}</p>

              <div className="d-flex flex-wrap gap-4">
                <span>
                  <strong>{user.followersCount}</strong> seguidores
                </span>
                <span>
                  <strong>{user.followingCount}</strong> siguiendo
                </span>
              </div>
            </div>

            {user.id !== currentUserId && (
              <button
                className={`btn align-self-sm-start ${
                  isFollowing ? "btn-outline-primary" : "btn-primary"
                }`}
                type="button"
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            )}
          </div>
        </div>
      </div>

      <h2 className="h5 mb-3">Publicaciones</h2>

      {visibleTweets.length > 0 ? (
        visibleTweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} user={user} />
        ))
      ) : (
        <div className="alert alert-light border" role="status">
          Este usuario todavía no tiene publicaciones.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={userTweets.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default UserTweetsPage;