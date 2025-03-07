export enum SocketEvent {
    JOIN_SESSION = "join-session",
    JOIN = "join",
    LEAVE_SESSION = "leave-session",
    SET_SOLUTION = "set-solution",
    TEXT_INPUT = "text-input",
    LANGUAGE_CHANGE = "language-change",
    SET_ADMIN = "set-admin",
    REMOVE_ADMIN = "remove-admin",
    LINTING_UPDATE = "linting-update",
}

export type Session = {
    id: string;
    language: string;
    code: string;
    solution: string;
    createdAt: string;
    createdBy: string;
    admins: string[];
    lintingEnabled: boolean;
};

export type ConnectedClient = {
    socketId: string;
    sessionId: string | null;
    userId: string;
};

export type CursorPosition = {
    lineNumber: number;
    column: number;
};

export type OnClientJoinedSession = {
    sessionId: string;
    socketId: string;
    userId: string;
};

export type OnClientLeftSession = {
    sessionId: string;
    socketId: string;
};

export type Template = {
    code: string;
    title: string;
    id: string;
    solution: string;
    language: string;
};
