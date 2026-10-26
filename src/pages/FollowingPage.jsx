import { useState } from "react";
import { followingIds, users } from "../data/mockData";
import Pagination, { PAGE_SIZE } from "../components/Pagination";
import UserCard from "../components/UserCard";

function FollowingPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const followingUsers = users
    .filter((user) => followingIds.includes(user.id))
    .sort((firstUser, secondUser) =>
      firstUser.fullName.localeCompare(secondUser.fullName, "es", {
        sensitivity: "base",
      }),
    );

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = followingUsers.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section>
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-1">Tu comunidad</p>
        <h1 className="h2 mb-1">Usuarios seguidos</h1>
        <p className="text-secondary mb-0">
          {followingUsers.length} personas
        </p>
      </div>

      {visibleUsers.length > 0 ? (
        visibleUsers.map((user) => <UserCard key={user.id} user={user} />)
      ) : (
        <div className="alert alert-light border" role="status">
          Todavía no sigues a ningún usuario.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={followingUsers.length}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}

export default FollowingPage;