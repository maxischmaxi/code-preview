"use client";

import { v4 } from "uuid";
import { generateNickname } from "./random-name";

export function getNickname() {
    if (typeof window === "undefined") return "";
    if (typeof window.localStorage === "undefined") return "";

    const localNickname = window.localStorage.getItem("nickname");
    if (!localNickname) {
        const nickname = generateNickname();
        window.localStorage.setItem("nickname", nickname);
        return nickname;
    }
    return localNickname;
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
