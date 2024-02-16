import { Bucket } from "sst/node/bucket";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function Page() {
  async function uploadPicture(formData: FormData) {
    "use server";

    const file = formData.get("file") as File;
    const species = formData.get("species") as string;
    const number = formData.get("number") as string;

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const client = new S3Client();
    const command = new PutObjectCommand({
      Body: fileBuffer,
      Bucket: Bucket.public.bucketName,
      Key: `${species}-${number}.jpg`,
      ContentType: file.type,
    });

    const response = await client.send(command);

    console.log(response);
  }

  return (
    <main className="w-full max-w-xs">
      <form action={uploadPicture} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
          JPG
        </label>
        <input
          name="file"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />

        <br />
        <label htmlFor="species" className="block text-gray-700 text-sm font-bold mb-2">
          Species
        </label>
        <input
          name="species"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />

        <br />
        <label htmlFor="number" className="block text-gray-700 text-sm font-bold mb-2">
          Number
        </label>
        <input
          name="number"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />

        <br />
        <input
          type="submit"
          className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          value="Submit"
        />
      </form>
    </main>
  );
}
