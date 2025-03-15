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
    SET_NICKNAME = "set-nickname",
    SET_LINTING = "set-linting",
    SET_SELECTION = "set-selection",
    REMOVE_CURSOR = "remove-cursor",
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
    linting: boolean;
    createdAt: string;
    createdBy: string;
    admins: string[];
    solutionPresented: boolean;
};

export type ConnectedClient = {
    socketId: string;
    sessionId: string | null;
    userId: string;
    nickname: string;
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

export type CursorSelection = {
    userId: string;
    sessionId: string;
    startColumn: number;
    startLineNumber: number;
    endColumn: number;
    endLineNumber: number;
};
