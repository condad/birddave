"use client";

export default async function UploadForm({ url }) {
  const submitForm = async (e) => {
    e.preventDefault();

    const file = (e.target as HTMLFormElement).file.files?.[0]!;

    const image = await fetch(url, {
      body: file,
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });

    console.log(image);

    window.location.href = image.url.split("?")[0];
  };
  return (
    <main>
      <form onSubmit={submitForm}>
        <input name="file" type="file" accept="image/png, image/jpeg" />
        <button type="submit">Upload</button>
      </form>
    </main>
  );
}
