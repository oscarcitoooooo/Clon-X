import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

/**
 * Changes a follow relationship and both public counters atomically.
 * Firestore rules verify that the counter updates match this relationship change.
 */
export async function updateFollowRelationship(
  firestoreDb,
  followerId,
  followedId,
  shouldFollow,
) {
  if (!firestoreDb || !followerId || !followedId) {
    throw new Error("Se necesita una sesión y dos perfiles válidos.");
  }

  if (followerId === followedId) {
    throw new Error("No puedes seguirte a ti mismo.");
  }

  return runTransaction(firestoreDb, async (transaction) => {
    const followerRef = doc(firestoreDb, "users", followerId);
    const followedRef = doc(firestoreDb, "users", followedId);
    const followRef = doc(
      firestoreDb,
      "follows",
      followerId,
      "following",
      followedId,
    );
    const operationRef = doc(firestoreDb, "followOperations", followerId);

    const [followSnapshot, followerSnapshot, followedSnapshot] =
      await Promise.all([
        transaction.get(followRef),
        transaction.get(followerRef),
        transaction.get(followedRef),
      ]);

    if (!followerSnapshot.exists() || !followedSnapshot.exists()) {
      const error = new Error("No se encontró uno de los perfiles en Firestore.");
      error.code = "profile-not-found";
      throw error;
    }

    const isFollowing = followSnapshot.exists();
    if (isFollowing === shouldFollow) return false;

    const followerData = followerSnapshot.data();
    const followedData = followedSnapshot.data();
    const followingCount = followerData.followingCount;
    const followersCount = followedData.followersCount;

    if (
      !Number.isInteger(followingCount) ||
      followingCount < 0 ||
      !Number.isInteger(followersCount) ||
      followersCount < 0 ||
      (!shouldFollow && (followingCount === 0 || followersCount === 0))
    ) {
      const error = new Error(
        "Los contadores actuales del perfil necesitan inicializarse antes de cambiar el seguimiento.",
      );
      error.code = "profile-counts-invalid";
      throw error;
    }

    const action = shouldFollow ? "follow" : "unfollow";
    const timestamp = serverTimestamp();

    transaction.set(operationRef, {
      targetId: followedId,
      action,
      createdAt: timestamp,
    });

    if (shouldFollow) {
      transaction.set(followRef, {
        followerId,
        followedId,
        createdAt: timestamp,
      });
      transaction.update(followerRef, { followingCount: followingCount + 1 });
      transaction.update(followedRef, { followersCount: followersCount + 1 });
    } else {
      transaction.delete(followRef);
      transaction.update(followerRef, { followingCount: followingCount - 1 });
      transaction.update(followedRef, { followersCount: followersCount - 1 });
    }

    return true;
  });
}
