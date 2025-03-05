"use client";

import { toast } from "sonner";
import copy from "copy-to-clipboard";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { ModeToggle } from "./mode-toggle";
import { Copy } from "lucide-react";
import { socket } from "@/lib/socket";
import { Button } from "./ui/button";
import { Session } from "@/lib/definitions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

type Props = {
    session: Session;
};

export function Editor({ session }: Props) {
    const [language, setLanguage] = useState<Session["language"]>(
        session.language,
    );
    const [code, setCode] = useState(session.code);
    const [connectedClients, setConnectedClients] = useState<{ id: string }[]>(
        [],
    );
    const [showConfigMenu, setShowConfigMenu] = useState(false);
    const [lintingEnabled, setLintingEnabled] = useState(
        session.lintingEnabled,
    );

    useEffect(() => {
        if (lintingEnabled) {
            document.body.classList.remove("hide-suggestions");
        } else {
            document.body.classList.add("hide-suggestions");
        }
    }, [lintingEnabled]);

    useEffect(() => {
        socket.emit("join-session", { id: session.id });

        return () => {
            socket.emit("leave-session", { id: session.id });
        };
    }, [session.id]);

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
            setCode(data.text);
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

        function onLintingUpdate(data: { lintingEnabled: boolean }) {
            setLintingEnabled(data.lintingEnabled);
        }

        function onLanguageChange(data: { language: Session["language"] }) {
            setLanguage(data.language);
        }

        socket.on("client-joined", onClientJoinedHandler);
        socket.on("text-input", onTextInputHandler);
        socket.on("disconnected", onDisconnectHandler);
        socket.on("connected-clients", onConnectedClientsHandler);
        socket.on("linting-update", onLintingUpdate);
        socket.on("language-change", onLanguageChange);

        return () => {
            socket.off("client-joined", onClientJoinedHandler);
            socket.off("text-input", onTextInputHandler);
            socket.off("disconnected", onDisconnectHandler);
            socket.off("connected-clients", onConnectedClientsHandler);
            socket.off("linting-update", onLintingUpdate);
            socket.off("language-change", onLanguageChange);
        };
    }, []);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key === ",") {
                e.preventDefault();
                setShowConfigMenu((prev) => !prev);
            }

            if (e.metaKey && e.key === "s") {
                e.preventDefault();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    function copyToClipboard() {
        const domain = window.location.origin;
        const url = `${domain}/${session.id}`;
        copy(url);
        toast("Copied to clipboard");
    }

    function onTextInputHandler(value: string | undefined) {
        if (!value) {
            socket.emit("text-input", { id: session.id, text: "", language });
        } else {
            socket.emit("text-input", {
                id: session.id,
                text: value,
                language,
            });
        }
    }

    function changeLanguage(language: Session["language"]) {
        setLanguage(language);
        socket.emit("language-change", {
            id: session.id,
            language,
        });
    }

    function enableLinting() {
        setLintingEnabled(true);
        socket.emit("linting-update", {
            id: session.id,
            lintingEnabled: true,
        });
    }

    function disableLinting() {
        setLintingEnabled(false);
        socket.emit("linting-update", {
            id: session.id,
            lintingEnabled: false,
        });
    }

    console.log(session);

    return (
        <div className="w-full h-full flex flex-col flex-nowrap">
            <header className="p-4 flex flex-row flex-nowrap justify-between items-center">
                <Badge className="cursor-pointer" onClick={copyToClipboard}>
                    {session.id}
                    <Copy />
                </Badge>
                <div className="flex flex-row flex-nowrap gap-4">
                    <div className="flex justify-center items-center py-2">
                        <Badge variant="outline">
                            {connectedClients.length}
                        </Badge>
                    </div>
                    <ModeToggle />
                </div>
            </header>
            <MonacoEditor
                wrapperProps={{ id: "editor" }}
                onChange={onTextInputHandler}
                onMount={(editor) => {
                    console.log(editor);
                }}
                theme="vs-dark"
                language={language}
                value={code}
                beforeMount={(monaco) => {
                    if (!lintingEnabled) {
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

                        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                            {
                                validate: false,
                            },
                        );

                        monaco.languages.css.cssDefaults.setOptions({
                            validate: false,
                        });
                    }
                }}
                onValidate={console.log}
                options={{
                    "semanticHighlighting.enabled": lintingEnabled,
                    codeLens: lintingEnabled,
                    automaticLayout: true,
                    theme: "vs-dark",
                    minimap: { enabled: false },
                    suggest: {
                        preview: lintingEnabled,
                        showWords: lintingEnabled,
                    },
                    tabSize: 4,
                    quickSuggestions: {
                        comments: lintingEnabled,
                        other: lintingEnabled,
                        strings: lintingEnabled,
                    },
                    parameterHints: {
                        enabled: lintingEnabled,
                    },
                    wordBasedSuggestions: lintingEnabled
                        ? "currentDocument"
                        : "off",
                    suggestOnTriggerCharacters: lintingEnabled,
                    acceptSuggestionOnEnter: lintingEnabled ? "on" : "off",
                    tabCompletion: lintingEnabled ? "on" : "off",
                    formatOnPaste: false,
                    formatOnType: false,
                    padding: { top: 16, bottom: 16 },
                    language,
                }}
            />
            <Dialog open={showConfigMenu} onOpenChange={setShowConfigMenu}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Config</DialogTitle>
                        <DialogDescription>
                            Here you can configure the editor
                        </DialogDescription>
                    </DialogHeader>
                    <p>
                        Select the language you want to use for the editor. This
                        will change the syntax highlighting.
                    </p>
                    <div className="flex flex-row flex-nowrap gap-4">
                        <Button
                            onClick={() => changeLanguage("typescript")}
                            variant={
                                language === "typescript"
                                    ? "secondary"
                                    : "outline"
                            }
                            type="button"
                        >
                            TS
                        </Button>
                        <Button
                            onClick={() => changeLanguage("javascript")}
                            type="button"
                            variant={
                                language === "javascript"
                                    ? "secondary"
                                    : "outline"
                            }
                        >
                            JS
                        </Button>
                        <Button
                            onClick={() => changeLanguage("css")}
                            type="button"
                            variant={
                                language === "css" ? "secondary" : "outline"
                            }
                        >
                            CSS
                        </Button>
                    </div>
                    <p>Linting: {lintingEnabled ? "Enabled" : "Disabled"}</p>
                    <div className="flex flex-row flex-nowrap gap-4">
                        <Button
                            onClick={enableLinting}
                            type="button"
                            variant={lintingEnabled ? "secondary" : "outline"}
                        >
                            Enable
                        </Button>
                        <Button
                            onClick={disableLinting}
                            type="button"
                            variant={!lintingEnabled ? "secondary" : "outline"}
                        >
                            Disable
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowConfigMenu(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
