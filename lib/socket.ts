"use client";

import { io } from "socket.io-client";

const url = "http://localhost:5172";

export const socket = io(url, {
    transports: ["websocket", "polling"],
});
