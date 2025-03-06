import * as monaco from "monaco-editor";

export type Session = {
    id: string;
    language: string;
    code: string;
    createdAt: string;
    lintingEnabled: boolean;
};

export type ConnectedClient = {
    socketId: string;
    id: string | null;
    cursorPosition: CursorPosition | null;
    cursorSelection: monaco.Selection | null;
    sessionId: string | null;
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

export type Templates = {
    [key: string]: {
        code: string;
        language: string;
        solution: string | null;
    };
};
