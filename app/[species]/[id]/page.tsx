import Image from "next/image";
import getConfig from "next/config";

export default async function Page({ params }) {
  const { publicRuntimeConfig } = getConfig();
  const birdImageURL = `${publicRuntimeConfig.bucketUrl}/${params.species}-${params.id}.jpg`;

  return (
    <div>
      <h1>Species: {params.species.toUpperCase()}</h1>
      <Image src={birdImageURL} alt="" height="100" width="150" />
    </div>
  );
}
