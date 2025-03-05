"use client";

import { io } from "socket.io-client";

const url = process.env.API_GATEWAY;

export const socket = io(url, {
    transports: ["websocket", "polling"],
});
