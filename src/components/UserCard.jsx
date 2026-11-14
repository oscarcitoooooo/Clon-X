import { Link } from "react-router";

function UserCard({
  user,
  showFollowButton = false,
  isFollowing = false,
  isDisabled = false,
  onToggleFollow,
}) {
  return (
    <article className="card border-0 shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center gap-3">
        <div>
          <Link
            className="fw-semibold text-body text-decoration-none"
            to={`/users/${user.username}`}
          >
            {user.fullName || user.username}
          </Link>
          <p className="text-secondary mb-0">@{user.username}</p>
        </div>

        {showFollowButton && (
          <button
            className={isFollowing ? "btn btn-outline-secondary" : "btn btn-primary"}
            type="button"
            onClick={() => onToggleFollow?.(user)}
            disabled={isDisabled}
          >
            {isDisabled ? "Guardando..." : isFollowing ? "Dejar de seguir" : "Seguir"}
          </button>
        )}
      </div>
    </article>
  );
}

export default UserCard;
