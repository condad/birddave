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
  const uploadDate = new Date(bird.uploadedAt);

  return (
    <>
      <h1 className="text-lg font-bold">{bird.commonName}</h1>
      <h1 className="font-thin italic">({bird.species})</h1>
      <br />
      <h2 className="text-sm font-thin">By {author.email}</h2>
      <h2 className="text-sm font-thin">on {uploadDate.toDateString()}</h2>
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
