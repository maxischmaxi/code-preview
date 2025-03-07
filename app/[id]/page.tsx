import { Session, Template } from "@/lib/definitions";
import { getApiGateway } from "@/lib/utils";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor").then((mod) => mod.Editor), { ssr: !!false });

type Props = {
  params: Promise<{ id:string}>;
}

async function getSessionById(id: string): Promise<Session> {
  const res = await fetch(`${getApiGateway()}/session/${id}`,{
    method: "GET",
    cache: "no-cache",
  });

  if(!res.ok || res.status !== 200) {
    throw new Error("Failed to fetch session");
  }

  return await res.json() as Session;
}

async function getAllTemplates(): Promise<Template[]> {
  const res = await fetch(`${getApiGateway()}/templates`, {
    method: "GET",
    cache: "no-cache",
  });

  if(!res.ok || res.status !== 200) {
    throw new Error("Failed to fetch templates")
  }

  return await res.json() as Template[];
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const session = await getSessionById(id);
  const templates = await getAllTemplates();

  return (
    <Editor session={session} templates={templates} />
  )
}
