import { Session } from "./definitions";

const base = "http://localhost:5172";

export function createUrl(path: string) {
  return `${base}${path}`;
}

async function createSession(): Promise<Session> {
  const res = await fetch(createUrl("/session"), {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  return await res.json();
}

async function getAllSessions(): Promise<Session[]> {
  const res = await fetch(createUrl("/sessions"), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to get all sessions");
  }

  return await res.json();
}

async function getSession(id: string): Promise<Session> {
  const res = await fetch(createUrl("/session/" + id), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to get session");
  }

  return await res.json();
}

const api = {
  session: {
    createSession,
    getAllSessions,
    getSession,
  },
};

export default api;
