export enum SocketEvent {
    JOIN_SESSION = "join-session",
    JOIN = "join",
    LEAVE_SESSION = "leave-session",
    SET_SOLUTION = "set-solution",
    TEXT_INPUT = "text-input",
    LANGUAGE_CHANGE = "language-change",
    SET_ADMIN = "set-admin",
    REMOVE_ADMIN = "remove-admin",
    SOLUTION_PRESENTED = "solution-presented",
    SEND_CURSOR_POSITION = "send-cursor-position",
    REMOVE_CURSOR_POISITON = "remove-cursor-position",
}

export type CursorPosition = {
    sessionId: string;
    userId: string;
    cursor: {
        column: number;
        lineNumber: number;
    };
};

export type Session = {
    id: string;
    language: string;
    code: string;
    solution: string;
    createdAt: string;
    createdBy: string;
    admins: string[];
    solutionPresented: boolean;
};

export type ConnectedClient = {
    socketId: string;
    sessionId: string | null;
    userId: string;
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
