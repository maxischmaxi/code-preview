"use client";

import { v4 } from "uuid";

export function getNickname() {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("nickname") || "";
}

export function getId() {
    if (typeof window === "undefined") return v4();
    const localId = window.localStorage.getItem("id");
    if (localId) {
        return localId;
    }

    const id = v4();
    window.localStorage.setItem("id", id);
    return id;
}
