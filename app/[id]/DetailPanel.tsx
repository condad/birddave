"use client";
import type { Bird, User } from "../types";

export default function DetailPanel({
  bird,
  author,
  currentUser,
  deletePhoto,
}: {
  bird: Bird;
  author: User;
  currentUser: User | null;
  deletePhoto: (id: string) => void;
}) {
  const currentUserIsAuthor = currentUser != null && author.email == currentUser.email;

  return (
    <>
      <h1>🦜 {bird.commonName}</h1>
      <h1>📖 {bird.species}</h1>
      <h1>🗓️ {bird.uploadedAt}</h1>
      <h2>📷 {author.email}</h2>
      {currentUserIsAuthor && (
        <button
          onClick={() => deletePhoto(bird.id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
          Delete
        </button>
      )}
    </>
  );
}
