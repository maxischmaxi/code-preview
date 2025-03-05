import { Session } from "./definitions";

export function createUrl(path: string) {
    return `https://${process.env.NEXT_PUBLIC_API_GATEWAY}${path}`;
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

async function joinSession(sessionId: string): Promise<Session> {
    const userId = localStorage.getItem("id");

    const res = await fetch(
        createUrl("/session/" + sessionId + "/join?userId=" + userId),
        {
            method: "GET",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to join session");
    }

    return await res.json();
}

const api = {
    session: {
        createSession,
        getAllSessions,
        getSession,
        joinSession,
    },
};

export default api;
