import { Session } from "@/lib/definitions";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor").then((mod) => mod.Editor), { ssr: !!false });

type Props = {
  params: Promise<{ id:string}>;
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const res = await fetch(`https://${process.env.NEXT_PUBLIC_API_GATEWAY}/session/${id}`,{
    method: "GET",
    cache: "no-cache",
  });

  if(!res.ok || res.status !== 200) {
    throw new Error("Failed to fetch session");
  }

  const session = await res.json() as Session;

  return (
    <Editor session={session} />
  )
}
