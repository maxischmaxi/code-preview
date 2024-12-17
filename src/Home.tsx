import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { useQueryGetAllSessions } from "./hooks/useQueryGetAllSessions";
import api from "./lib/api";
import { useMutation } from "@tanstack/react-query";

export function Home() {
  const sessions = useQueryGetAllSessions();

  const createSession = useMutation({
    async mutationFn() {
      return await api.session.createSession();
    },
  });

  return (
    <div>
      <ul>
        {sessions.data?.map((session) => (
          <li key={session.id}>
            <Link
              to={`/${session.id}`}
              className="text-blue-500 text-sm hover:underline"
            >
              {session.name}
            </Link>
          </li>
        ))}
      </ul>
      <Button
        loading={createSession.isPending}
        disabled={createSession.isPending}
        onClick={async () => {
          await createSession.mutateAsync();
        }}
      >
        Create Session
      </Button>
    </div>
  );
}
