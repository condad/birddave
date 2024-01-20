import type { PageProps } from "@/.next/types/app/page";

export const dynamicParams = false;

type Bird = {
  species: string;
};

export async function generateStaticParams(): Promise<Bird[]> {
  // TODO:   Loop through bird pictures in files system

  return [
    { species: "robin" },
    { species: "jay" },
    { species: "magpie" },
    { species: "crow" },
  ];
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function Page({ params }: PageProps) {
  const { species } = params;

  return (
    <div>
      <h1>{species}</h1>
    </div>
  );
}
