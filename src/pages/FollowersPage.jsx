import { useState } from "react";
import {
  currentUserId,
  followerIds,
  followingIds,
  users,
} from "../data/mockData";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import UserCard from "../components/UserCard";

function FollowersPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const followerUsers = users
    .filter((user) => followerIds.includes(user.id))
    .sort((firstUser, secondUser) =>
      firstUser.fullName.localeCompare(secondUser.fullName, "es", {
        sensitivity: "base",
      }),
    );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = followerUsers.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Tu comunidad</p>
        <h1 className="h2 mb-1">Seguidores</h1>
        <p className="text-secondary mb-0">{followerUsers.length} personas</p>
      </div>

      {visibleUsers.length > 0 ? (
        visibleUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            showFollowButton={
              user.id !== currentUserId && !followingIds.includes(user.id)
            }
          />
        ))
      ) : (
        <div className="alert alert-light border" role="status">
          Todavía no tienes seguidores.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={followerUsers.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FollowersPage;