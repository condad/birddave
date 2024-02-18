import getConfig from "next/config";
import Image from "next/image";

export default async function Page({ params }) {
  const { publicRuntimeConfig } = getConfig();
  const birdImageURL = `${publicRuntimeConfig.bucketUrl}/${params.species}-${params.id}.jpg`;

  return (
    <div>
      <Image src={birdImageURL} alt="" width={1000} height={1000} />
    </div>
  );
}
