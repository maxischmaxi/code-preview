"use client";

import { io } from "socket.io-client";

const url = `https://${process.env.NEXT_PUBLIC_API_GATEWAY}`;

export const socket = io(url, {
    transports: ["websocket", "polling"],
});
