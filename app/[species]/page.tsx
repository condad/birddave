import Image from "next/image";
import fs from "fs";

type Bird = {
  species: string;
  link: string;
};

async function getBirds(): Promise<Bird[]> {
  const BIRD_PIC_DIR = "/Users/connor.sullivan/practice/birddave/public/pics";
  const birds: Bird[] = [];

  const files = await fs.promises.readdir(BIRD_PIC_DIR);

  for (const file of files) {
    const [species, ..._] = file.split(".");
    birds.push({ species: species, link: file });
  }

  return birds;
}

export async function generateStaticParams(): Promise<Bird[]> {
  return await getBirds();
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }) {
  const birds = await getBirds();
  const bird = birds.find((bird) => bird.species === params.species);

  if (!bird) {
    return <div>404</div>;
  }

  return (
    <div>
      <h1>Species: {bird.species}</h1>
      <Image src={`/pics/${bird.link}`} alt="" height="100" width="150" />
    </div>
  );
}
