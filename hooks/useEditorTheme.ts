"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

export function useEditorTheme() {
    const { theme, systemTheme } = useTheme();
    const editorTheme = useMemo(() => {
        if (theme === "system") {
            return systemTheme === "dark" ? "vs-dark" : "vs";
        }
        return theme === "dark" ? "vs-dark" : "vs";
    }, [systemTheme, theme]);
    return editorTheme;
}
