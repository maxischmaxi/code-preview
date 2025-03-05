"use client";

import { toast } from "sonner";
import copy from "copy-to-clipboard";
import { useQueryGetSession } from "@/hooks/useQueryGetSession";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { ModeToggle } from "./mode-toggle";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { socket } from "@/lib/socket";
import { Button } from "./ui/button";
import { Session } from "@/lib/definitions";

type Props = {
    id: string;
};

export function Editor({ id }: Props) {
    const [language, setLanguage] = useState<Session["language"]>("typescript");
    const session = useQueryGetSession(id);
    const { theme } = useTheme();
    const [value, setValue] = useState("");
    const [connectedClients, setConnectedClients] = useState<{ id: string }[]>(
        [],
    );

    useEffect(() => {
        if (session.data) {
            setValue(session.data.code);
            setLanguage(session.data.language);
        }
    }, [session.data]);

    useEffect(() => {
        socket.emit("join-session", { id });

        return () => {
            socket.emit("leave-session", { id });
        };
    }, [id]);

    useEffect(() => {
        function onClientJoinedHandler(data: {
            sessionId: string;
            socketId: string;
        }) {
            setConnectedClients((prev) => [...prev, { id: data.socketId }]);
        }

        function onTextInputHandler(data: {
            text: string;
            language: Session["language"];
        }) {
            setValue(data.text);
            setLanguage(data.language);
        }

        function onDisconnectHandler(data: { id: string }) {
            setConnectedClients((prev) =>
                prev.filter((client) => client.id !== data.id),
            );
        }

        function onConnectedClientsHandler(data: { id: string }[]) {
            setConnectedClients(data);
        }

        socket.on("client-joined", onClientJoinedHandler);
        socket.on("text-input", onTextInputHandler);
        socket.on("disconnected", onDisconnectHandler);
        socket.on("connected-clients", onConnectedClientsHandler);

        return () => {
            socket.off("client-joined", onClientJoinedHandler);
            socket.off("text-input", onTextInputHandler);
            socket.off("disconnected", onDisconnectHandler);
            socket.off("connected-clients", onConnectedClientsHandler);
        };
    }, []);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.shiftKey && e.key === "P") {
                doScreenshot();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    async function doScreenshot() {
        const el = document.getElementById("editor");
        if (!el) {
            toast("Error taking screenshot");
            return;
        }

        import("html2canvas").then((html2canvas) => {
            html2canvas.default(el).then((canvas) => {
                const img = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = img;
                a.download = "code_screenshot_" + Date.now() + ".png";
                a.click();
            });
        });
    }

    function copyToClipboard() {
        const domain = window.location.origin;
        const url = `${domain}/${id}`;
        copy(url);
        toast("Copied to clipboard");
    }

    function onTextInputHandler(value: string | undefined) {
        if (!value) {
            socket.emit("text-input", { id, text: "", language });
        } else {
            socket.emit("text-input", { id, text: value, language });
        }
    }

    function changeLanguage(language: "typescript" | "javascript" | "css") {
        setLanguage(language);
        socket.emit("text-input", { id, text: value, language });
    }

    if (session.isError) {
        return (
            <div className="w-full h-full flex flex-col flex-nowrap justify-center items-center">
                <p className="text-red-500 text-lg">Error fetching session</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col flex-nowrap">
            <header className="p-4 flex flex-row flex-nowrap justify-between items-center">
                <Badge className="cursor-pointer" onClick={copyToClipboard}>
                    {id}
                    <Copy />
                </Badge>
                <div className="flex flex-row flex-nowrap gap-4">
                    <div className="flex justify-center items-center py-2">
                        <Badge variant="outline">
                            {connectedClients.length}
                        </Badge>
                    </div>
                    <Button
                        onClick={() => changeLanguage("typescript")}
                        variant={
                            language === "typescript" ? "secondary" : "outline"
                        }
                        type="button"
                    >
                        TS
                    </Button>
                    <Button
                        onClick={() => changeLanguage("javascript")}
                        type="button"
                        variant={
                            language === "javascript" ? "secondary" : "outline"
                        }
                    >
                        JS
                    </Button>
                    <Button
                        onClick={() => changeLanguage("css")}
                        type="button"
                        variant={language === "css" ? "secondary" : "outline"}
                    >
                        CSS
                    </Button>
                    <ModeToggle />
                </div>
            </header>
            <MonacoEditor
                wrapperProps={{ id: "editor" }}
                onChange={onTextInputHandler}
                loading={session.isLoading}
                theme={theme === "dark" ? "vs-dark" : "vs"}
                language={language}
                value={value}
                defaultLanguage="typescript"
                onMount={(editor) => {
                    console.log("editor", editor);
                }}
                beforeMount={(monaco) => {
                    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                        {
                            target: monaco.languages.typescript.ScriptTarget
                                .ES2020,
                        },
                    );
                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                        {
                            noSemanticValidation: true,
                            noSyntaxValidation: true,
                        },
                    );

                    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: false,
                    });

                    monaco.languages.css.cssDefaults.setOptions({
                        lint: {
                            argumentsInColorFunction: "ignore",
                            boxModel: "ignore",
                            compatibleVendorPrefixes: "ignore",
                            duplicateProperties: "ignore",
                            emptyRules: "ignore",
                            float: "ignore",
                            fontFaceProperties: "ignore",
                            hexColorLength: "ignore",
                            idSelector: "ignore",
                            ieHack: "ignore",
                            important: "ignore",
                            importStatement: "ignore",
                            propertyIgnoredDueToDisplay: "ignore",
                            universalSelector: "ignore",
                            unknownProperties: "ignore",
                            unknownVendorSpecificProperties: "ignore",
                            vendorPrefix: "ignore",
                            zeroUnits: "ignore",
                        },
                        validate: false,
                    });
                }}
                options={{
                    "semanticHighlighting.enabled": false,
                    automaticLayout: true,
                    readOnly: Boolean(
                        session.isLoading ||
                            session.isPending ||
                            session.isError,
                    ),
                    minimap: { enabled: false },
                    suggest: { preview: false },
                    tabSize: 4,
                    quickSuggestions: false,
                    formatOnPaste: false,
                    formatOnType: false,
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    );
}
