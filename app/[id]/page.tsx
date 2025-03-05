import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor").then((mod) => mod.Editor), { ssr: !!false });

type Props = {
  params: Promise<{ id:string}>;
}

export default async function Page({ params }: Props) {
  const { id } = await params

  return (
    <Editor id={id} />
  )
}
