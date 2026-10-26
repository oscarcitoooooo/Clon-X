import { Link } from "react-router";

function TweetCard({ tweet, user }) {
  const fullName = user?.fullName ?? "Usuario desconocido";
  const username = user?.username ?? "usuario";
  const publishedAt = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(tweet.createdAt));

  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body p-4">
        <p className="fw-semibold mb-2">
          <Link
            className="text-body text-decoration-none"
            to={`/users/${username}`}
          >
            {fullName}
          </Link>
          {", "}
          <span className="text-secondary">@{username}</span>
          <span className="text-secondary"> - {publishedAt}</span>
        </p>

        <p className="mb-0 text-break">{tweet.content}</p>
      </div>
    </article>
  );
}

export default TweetCard;