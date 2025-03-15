import { Session } from "./definitions";
import { getId } from "./id";
import { getApiGateway } from "./utils";

export function createUrl(path: string) {
    const apiGateway = getApiGateway();
    if (process.env.NODE_ENV === "development") {
        return `${apiGateway}${path}`;
    }
    return `${apiGateway}${path}`;
}

async function createSession(nickname: string): Promise<Session> {
    const res = await fetch(createUrl("/session"), {
        method: "POST",
        body: JSON.stringify({
            id: getId(),
            nickname,
        }),
        headers: {
            "Content-Type": "application/json",
        },
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
    if (
        typeof window === "undefined" ||
        typeof window.localStorage === "undefined"
    ) {
        return Promise.reject("Failed to join session");
    }

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
