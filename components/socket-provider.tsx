"use client";

import { SocketEvent } from "@/lib/definitions";
import { getId, getNickname } from "@/lib/id";
import { getApiGateway } from "@/lib/utils";
import { createContext, ReactNode, useEffect, useState } from "react";
import { io } from "socket.io-client";

type IUseSocket = {
    ready: boolean;
};

export const SocketContext = createContext<IUseSocket>({
    ready: false,
});

export const socket = io(getApiGateway(), {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            setReady(true);
            if (
                typeof window === "undefined" ||
                typeof window.localStorage === "undefined"
            ) {
                return;
            }
            socket.emit(SocketEvent.JOIN, {
                id: getId(),
                nickname: getNickname(),
            });
        });

        return function () {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ ready }}>
            {children}
        </SocketContext.Provider>
    );
}
