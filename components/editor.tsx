"use client";

/**
 * - add support for admin roles
 * - admin adds password to session
 * - split view with solution
 * - admin can assign admin role
 * - user badges with random animal names on top
 * - set own username after joining session
 * - multicursor functionality, with colors and names
 **/

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import copy from "copy-to-clipboard";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { ModeToggle } from "./mode-toggle";
import { CodeIcon, Copy, Plus, Settings, Users } from "lucide-react";
import { Button } from "./ui/button";
import {
    ConnectedClient,
    Session,
    SocketEvent,
    Template,
} from "@/lib/definitions";
import { getId } from "@/lib/id";
import { useEditorTheme } from "@/hooks/useEditorTheme";
import { socket, SocketContext } from "./socket-provider";
import { ConfigMenuDialog } from "./config-menu-dialog";
import { UserPanel } from "./user-panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NewTemplateDialog } from "./new-template-dialog";

type Props = {
    session: Session;
    templates: Template[];
};

const id = getId();

export function Editor({ session, templates }: Props) {
    const theme = useEditorTheme();
    const { ready } = use(SocketContext);
    const [language, setLanguage] = useState<Session["language"]>(
        session.language,
    );
    const [code, setCode] = useState(session.code);
    const [solution, setSolution] = useState(session.solution);
    const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
        [],
    );
    const [showConfigMenu, setShowConfigMenu] = useState(false);
    const [lintingEnabled, setLintingEnabled] = useState(
        session.lintingEnabled,
    );
    const monacoRef = useRef<Monaco>(null);
    const [admins, setAdmins] = useState<string[]>(session.admins);
    const [showSolution, setShowSolution] = useState(id === session.createdBy);
    const [showUsers, setShowUsers] = useState(false);
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);

    console.log(session);

    const setPreviewEditorOptions = useCallback((monaco: Monaco) => {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
        });

        monaco.languages.css.cssDefaults.setOptions({
            validate: true,
        });
    }, []);

    const setMonacoEditorOptions = useCallback(
        (monaco: Monaco, lintingEnabled: boolean) => {
            if (!lintingEnabled) {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                    {
                        target: monaco.languages.typescript.ScriptTarget.ES2020,
                    },
                );

                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                    {
                        noSemanticValidation: true,
                        noSyntaxValidation: true,
                    },
                );

                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                    {
                        noSemanticValidation: true,
                        noSyntaxValidation: true,
                    },
                );

                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: false,
                });

                monaco.languages.css.cssDefaults.setOptions({
                    validate: false,
                });
            } else {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                    {
                        target: monaco.languages.typescript.ScriptTarget.ES2020,
                    },
                );

                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                    {
                        noSemanticValidation: false,
                        noSyntaxValidation: false,
                    },
                );

                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                    {
                        noSemanticValidation: false,
                        noSyntaxValidation: false,
                    },
                );

                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                });

                monaco.languages.css.cssDefaults.setOptions({
                    validate: true,
                });
            }
        },
        [],
    );

    useEffect(() => {
        if (!monacoRef.current) return;
        setMonacoEditorOptions(monacoRef.current, lintingEnabled);
    }, [lintingEnabled, setMonacoEditorOptions]);

    useEffect(() => {
        if (lintingEnabled) {
            document.body.classList.remove("hide-suggestions");
        } else {
            document.body.classList.add("hide-suggestions");
        }
    }, [lintingEnabled]);

    useEffect(() => {
        if (ready) {
            socket.emit(SocketEvent.JOIN_SESSION, {
                sessionId: session.id,
                userId: id,
            });
        }
    }, [ready, session.id]);

    useEffect(() => {
        function onClientsHandler(data: ConnectedClient[]) {
            setConnectedClients(data);
        }

        function onTextInputHandler(data: {
            text: string;
            language: Session["language"];
        }) {
            setCode(data.text);
            setLanguage(data.language);
        }

        function onLintingUpdate(data: { lintingEnabled: boolean }) {
            setLintingEnabled(data.lintingEnabled);
        }

        function onLanguageChange(data: { language: Session["language"] }) {
            setLanguage(data.language);
        }

        function onSetAdminHandler(admins: string[]) {
            setAdmins(admins);
        }

        function onRemoveAdminHandler(admins: string[]) {
            setAdmins(admins);
        }

        function onSetSolutionHandler(data: string) {
            setSolution(data);
        }

        socket.on(SocketEvent.JOIN_SESSION, onClientsHandler);
        socket.on(SocketEvent.LEAVE_SESSION, onClientsHandler);
        socket.on(SocketEvent.TEXT_INPUT, onTextInputHandler);
        socket.on(SocketEvent.LINTING_UPDATE, onLintingUpdate);
        socket.on(SocketEvent.LANGUAGE_CHANGE, onLanguageChange);
        socket.on(SocketEvent.SET_ADMIN, onSetAdminHandler);
        socket.on(SocketEvent.REMOVE_ADMIN, onRemoveAdminHandler);
        socket.on(SocketEvent.SET_SOLUTION, onSetSolutionHandler);

        return () => {
            socket.off(SocketEvent.JOIN_SESSION, onClientsHandler);
            socket.off(SocketEvent.LEAVE_SESSION, onClientsHandler);
            socket.off(SocketEvent.TEXT_INPUT, onTextInputHandler);
            socket.off(SocketEvent.LINTING_UPDATE, onLintingUpdate);
            socket.off(SocketEvent.LANGUAGE_CHANGE, onLanguageChange);
            socket.off(SocketEvent.SET_ADMIN, onSetAdminHandler);
            socket.off(SocketEvent.REMOVE_ADMIN, onRemoveAdminHandler);
            socket.off(SocketEvent.SET_SOLUTION, onSetSolutionHandler);
        };
    }, []);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key === ",") {
                if (id === session.createdBy || admins.includes(id)) {
                    e.preventDefault();
                    setShowConfigMenu((prev) => !prev);
                }
            }

            if (e.metaKey && e.key === "s") {
                e.preventDefault();
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [admins, session.createdBy]);

    function copyToClipboard() {
        const domain = window.location.origin;
        const url = `${domain}/${session.id}`;
        copy(url);
        toast("Copied to clipboard");
    }

    function onTextInputHandler(value: string | undefined) {
        if (!value) {
            socket.emit(SocketEvent.TEXT_INPUT, { id: session.id, text: "" });
        } else {
            socket.emit(SocketEvent.TEXT_INPUT, {
                sessionId: session.id,
                text: value,
                userId: id,
            });
        }
    }

    function enableLinting() {
        setLintingEnabled(true);
        socket.emit(SocketEvent.LINTING_UPDATE, {
            sessionId: session.id,
            lintingEnabled: true,
            userId: id,
        });
    }

    function disableLinting() {
        setLintingEnabled(false);
        socket.emit(SocketEvent.LINTING_UPDATE, {
            sessionId: session.id,
            lintingEnabled: false,
            userId: id,
        });
    }

    function selectTemplate(templateId: string) {
        const template = templates.find((t) => t.id === templateId);

        if (!template) {
            toast("Template not found");
            return;
        }

        socket.emit(SocketEvent.SET_SOLUTION, {
            sessionId: session.id,
            userId: id,
            templateId: templateId,
        });

        socket.emit(SocketEvent.LINTING_UPDATE, {
            sessionId: session.id,
            language: template.language,
            userId: id,
        });

        setCode(code);
        setLanguage(language);
        setShowConfigMenu(false);
        setSolution(template.solution);
    }

    function toggleUserAdmin(client: ConnectedClient) {
        if (admins.includes(client.userId)) {
            socket.emit(SocketEvent.REMOVE_ADMIN, {
                sessionId: session.id,
                userId: client.userId,
            });
        } else {
            socket.emit(SocketEvent.SET_ADMIN, {
                sessionId: session.id,
                userId: client.userId,
            });
        }
    }

    return (
        <div className="w-full h-full flex flex-col flex-nowrap">
            <header className="p-4 flex flex-row flex-nowrap justify-between items-center border-b">
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
                    {(id === session.createdBy || admins.includes(id)) && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={
                                            showSolution
                                                ? "secondary"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            setShowSolution((prev) => !prev)
                                        }
                                        size="icon"
                                    >
                                        <CodeIcon />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {showSolution
                                        ? "Hide Solution"
                                        : "Show Solution"}
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={
                                            showConfigMenu
                                                ? "secondary"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            setShowConfigMenu((prev) => !prev)
                                        }
                                    >
                                        <Settings />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Settings</TooltipContent>
                            </Tooltip>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => setShowNewTemplateDialog(true)}
                            >
                                <Plus />
                            </Button>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={
                                            showUsers ? "secondary" : "outline"
                                        }
                                        onClick={() =>
                                            setShowUsers((prev) => !prev)
                                        }
                                    >
                                        <Users />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {showUsers ? "Hide Users" : "Show Users"}
                                </TooltipContent>
                            </Tooltip>
                        </>
                    )}
                    <ModeToggle />
                </div>
            </header>
            <div className="flex flex-row flex-nowrap w-full h-full">
                <PanelGroup direction="horizontal">
                    <Panel>
                        <MonacoEditor
                            onChange={onTextInputHandler}
                            theme={theme}
                            language={language}
                            className="w-full h-full"
                            value={code}
                            beforeMount={(monaco) => {
                                monacoRef.current = monaco;
                                setMonacoEditorOptions(monaco, lintingEnabled);
                            }}
                            options={{
                                "semanticHighlighting.enabled": lintingEnabled,
                                contextmenu: lintingEnabled,
                                codeLens: lintingEnabled,
                                automaticLayout: true,
                                theme,
                                minimap: { enabled: false },
                                hover: {
                                    enabled: lintingEnabled,
                                    delay: 250,
                                },
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
                                acceptSuggestionOnEnter: lintingEnabled
                                    ? "on"
                                    : "off",
                                tabCompletion: lintingEnabled ? "on" : "off",
                                formatOnPaste: false,
                                formatOnType: false,
                                padding: { top: 16, bottom: 16 },
                                language,
                            }}
                        />
                    </Panel>
                    {showSolution && (
                        <>
                            <PanelResizeHandle className="w-1 bg-secondary" />
                            <Panel>
                                <MonacoEditor
                                    theme={theme}
                                    beforeMount={setPreviewEditorOptions}
                                    className="w-full h-full"
                                    value={solution}
                                    options={{
                                        theme,
                                        minimap: { enabled: false },
                                        readOnly: true,
                                        padding: { top: 16, bottom: 16 },
                                    }}
                                />
                            </Panel>
                        </>
                    )}
                    {showUsers && (
                        <>
                            <PanelResizeHandle className="w-1 bg-secondary" />
                            <Panel>
                                <UserPanel
                                    admins={admins}
                                    connectedClients={connectedClients}
                                    session={session}
                                    toggleUserAdmin={toggleUserAdmin}
                                />
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>
            <NewTemplateDialog
                open={showNewTemplateDialog}
                setOpen={setShowNewTemplateDialog}
            />
            <ConfigMenuDialog
                open={showConfigMenu}
                templates={templates}
                selectTemplate={selectTemplate}
                setOpen={setShowConfigMenu}
                enableLinting={enableLinting}
                lintingEnabled={lintingEnabled}
                disableLinting={disableLinting}
            />
        </div>
    );
}
