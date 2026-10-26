import { Link } from "react-router";

function UserCard({ user, showFollowButton = false }) {
  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center gap-3">
        <div>
          <Link
            className="fw-semibold text-body text-decoration-none"
            to={`/users/${user.username}`}
          >
            {user.fullName}
          </Link>
          <p className="text-secondary mb-0">@{user.username}</p>
        </div>

        {showFollowButton && (
          <button className="btn btn-outline-primary" type="button">
            Seguir
          </button>
        )}
      </div>
    </article>
  );
}

export default UserCard;