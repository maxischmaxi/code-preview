"use client";

import { PanelGroup, Panel } from "react-resizable-panels";
import { toast } from "sonner";
import copy from "copy-to-clipboard";
import { Monaco, Editor as MonacoEditor } from "@monaco-editor/react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import {
    ConnectedClient,
    CursorPosition,
    CursorSelection,
    Session,
    SocketEvent,
    Template,
} from "@/lib/definitions";
import { getId } from "@/lib/id";
import { useEditorTheme } from "@/hooks/useEditorTheme";
import { socket, SocketContext } from "./socket-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NicknameDialog } from "./nickname-dialog";
import { AdminPanel } from "./admin-panel";
import { Solution } from "./solution";
import { Avatars } from "./avatars";

type Props = {
    session: Session;
    templates: Template[];
};

const id = getId();

export function Editor({ session, templates }: Props) {
    const theme = useEditorTheme();

    const { ready } = use(SocketContext);
    const [lang, setLang] = useState<Session["language"]>(session.language);
    const [code, setCode] = useState(session.code);
    const [solution, setSolution] = useState(session.solution);
    const [linting, setLinting] = useState(session.linting);
    const [clients, setClients] = useState<ConnectedClient[]>([]);
    const [admins, setAdmins] = useState<string[]>(session.admins);
    const [solutionPresented, setSolutionPresented] = useState(
        session.solutionPresented,
    );
    const editorRef = useRef<Monaco | null>(null);
    const decorationsRef = useRef(null);
    const [cursorPositions, setCursorPositions] = useState<
        Array<Omit<CursorPosition, "sessionId">>
    >([]);
    const [cursorSelections, setCursorSelections] = useState<
        Array<Omit<CursorSelection, "sessionId">>
    >([]);

    const updateCursors = useCallback(
        (
            positions: Array<Omit<CursorPosition, "sessionId">>,
            selections: Array<Omit<CursorSelection, "sessionId">>,
        ) => {
            if (!decorationsRef.current) {
                return;
            }
            if (!editorRef.current) {
                return;
            }

            const newDecorations = [];

            for (const position of positions) {
                if (position.userId === id) {
                    continue;
                }

                newDecorations.push({
                    range: new editorRef.current.Range(
                        position.cursor.lineNumber,
                        position.cursor.column,
                        position.cursor.lineNumber,
                        position.cursor.column,
                    ),
                    options: {
                        className: `multi-cursor-position multi-cursor-position-${position.userId}`,
                        inWholeLine: false,
                        afterContentClassName: `cursor-label-${position.userId}`,
                    },
                });
            }

            for (const selection of selections) {
                newDecorations.push({
                    range: new editorRef.current.Range(
                        selection.startLineNumber,
                        selection.startColumn,
                        selection.endLineNumber,
                        selection.endColumn,
                    ),
                    options: {
                        className: `multi-cursor-selection multi-cursor-selection-${selection.userId}`,
                        inWholeLine: true,
                    },
                });
            }

            // @ts-expect-error - Property 'set' does not exist on type 'DecorationsCollection'.
            decorationsRef.current.set(newDecorations);

            setTimeout(() => {
                const positions = document.querySelectorAll(
                    ".multi-cursor-position",
                );

                for (const element of positions) {
                    element.innerHTML = "";
                }

                for (const client of clients) {
                    const positionNode = document.querySelector(
                        `.multi-cursor-position-${client.userId}`,
                    );

                    if (positionNode) {
                        const label = document.createElement("div");
                        label.className = "cursor-label-default";
                        label.textContent = client.nickname;
                        positionNode.appendChild(label);
                    }
                }
            }, 32);
        },
        [clients],
    );

    useEffect(() => {
        if (ready) {
            socket.emit(SocketEvent.JOIN_SESSION, {
                sessionId: session.id,
                userId: id,
            });
        }
    }, [ready, session.id]);

    useEffect(() => {
        updateCursors(cursorPositions, cursorSelections);
    }, [cursorPositions, cursorSelections, updateCursors]);

    useEffect(() => {
        function onClientsHandler(data: ConnectedClient[]) {
            setClients(data);
        }

        function onTextInputHandler(data: {
            text: string;
            language: Session["language"];
        }) {
            setCode(data.text);
            setLang(data.language);
        }

        function onLanguageChange(data: { language: Session["language"] }) {
            setLang(data.language);
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

        function onSolutionPresentedHandler(data: boolean) {
            setSolutionPresented(data);
        }

        function onCursorPositionHandler(data: CursorPosition[]) {
            setCursorPositions(data);
        }

        function onSetNicknameHandler(client: ConnectedClient) {
            if (client.userId === id) {
                return;
            }

            setClients((prev) => {
                const newClients = structuredClone(prev);
                const index = newClients.findIndex(
                    (c) => c.userId === client.userId,
                );
                if (index === -1) {
                    return [...newClients, client];
                }

                newClients[index] = client;
                return newClients;
            });
        }

        function onLintingHandler(data: boolean) {
            setLinting(data);
        }

        function onRemoveSelection(userId: string) {
            setCursorPositions((prev) => {
                const newPositions = structuredClone(prev);
                const index = newPositions.findIndex(
                    (s) => s.userId === userId,
                );
                if (index === -1) {
                    return newPositions;
                }

                newPositions.splice(index, 1);
                return newPositions;
            });
            setCursorSelections((prev) => {
                const newSelections = structuredClone(prev);
                const index = newSelections.findIndex(
                    (s) => s.userId === userId,
                );
                if (index === -1) {
                    return newSelections;
                }

                newSelections.splice(index, 1);
                return newSelections;
            });
        }

        function onSetSelection(data: CursorSelection[]) {
            setCursorSelections(data);
        }

        socket.on(SocketEvent.JOIN_SESSION, onClientsHandler);
        socket.on(SocketEvent.LEAVE_SESSION, onClientsHandler);
        socket.on(SocketEvent.TEXT_INPUT, onTextInputHandler);
        socket.on(SocketEvent.LANGUAGE_CHANGE, onLanguageChange);
        socket.on(SocketEvent.SET_ADMIN, onSetAdminHandler);
        socket.on(SocketEvent.REMOVE_ADMIN, onRemoveAdminHandler);
        socket.on(SocketEvent.SET_SOLUTION, onSetSolutionHandler);
        socket.on(SocketEvent.SOLUTION_PRESENTED, onSolutionPresentedHandler);
        socket.on(SocketEvent.SEND_CURSOR_POSITION, onCursorPositionHandler);
        socket.on(SocketEvent.SET_NICKNAME, onSetNicknameHandler);
        socket.on(SocketEvent.SET_LINTING, onLintingHandler);
        socket.on(SocketEvent.SET_SELECTION, onSetSelection);
        socket.on(SocketEvent.REMOVE_CURSOR, onRemoveSelection);

        return () => {
            socket.off(SocketEvent.JOIN_SESSION, onClientsHandler);
            socket.off(SocketEvent.LEAVE_SESSION, onClientsHandler);
            socket.off(SocketEvent.TEXT_INPUT, onTextInputHandler);
            socket.off(SocketEvent.LANGUAGE_CHANGE, onLanguageChange);
            socket.off(SocketEvent.SET_ADMIN, onSetAdminHandler);
            socket.off(SocketEvent.REMOVE_ADMIN, onRemoveAdminHandler);
            socket.off(SocketEvent.SET_SOLUTION, onSetSolutionHandler);
            socket.off(
                SocketEvent.SOLUTION_PRESENTED,
                onSolutionPresentedHandler,
            );
            socket.off(
                SocketEvent.SEND_CURSOR_POSITION,
                onCursorPositionHandler,
            );
            socket.off(SocketEvent.SET_NICKNAME, onSetNicknameHandler);
            socket.off(SocketEvent.SET_LINTING, onLintingHandler);
            socket.off(SocketEvent.SET_SELECTION, onSetSelection);
            socket.off(SocketEvent.REMOVE_CURSOR, onRemoveSelection);
        };
    }, []);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key === "s") {
                e.preventDefault();
            }
        }

        function onBlur() {
            socket.emit(SocketEvent.REMOVE_CURSOR, {
                sessionId: session.id,
                userId: id,
            });
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("blur", onBlur);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("blur", onBlur);
        };
    }, [admins, session.createdBy, session.id]);

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

    function makeUserAdmin(client: ConnectedClient) {
        socket.emit(SocketEvent.SET_ADMIN, {
            sessionId: session.id,
            userId: client.userId,
        });
    }

    function makeUserNotAdmin(client: ConnectedClient) {
        socket.emit(SocketEvent.REMOVE_ADMIN, {
            sessionId: session.id,
            userId: client.userId,
        });
    }

    function handleSetSolutionPresented(presented: boolean) {
        setSolutionPresented(presented);
        socket.emit(SocketEvent.SOLUTION_PRESENTED, {
            sessionId: session.id,
            userId: id,
            presented,
        });
    }

    const isAdmin = session.createdBy === id || admins.includes(id);

    return (
        <div className="w-full h-full flex flex-col flex-nowrap">
            <header className="p-4 flex flex-row flex-nowrap justify-between items-center border-b">
                <div className="flex flex-row flex-nowrap gap-4">
                    <NicknameDialog />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" onClick={copyToClipboard}>
                                <ClipboardCopy />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Copy session link to clipboard
                        </TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex flex-row flex-nowrap gap-4 items-center">
                    <Avatars connectedClients={clients} />
                    <AdminPanel
                        isAdmin={isAdmin}
                        templates={templates}
                        session={session}
                        setCode={setCode}
                        setLang={setLang}
                        setSolution={setSolution}
                        setSolutionPresented={handleSetSolutionPresented}
                        admins={admins}
                        connectedClients={clients}
                        solutionPresented={solutionPresented}
                        makeUserAdmin={makeUserAdmin}
                        makeUserNotAdmin={makeUserNotAdmin}
                    />
                    <ModeToggle />
                </div>
            </header>
            <div className="flex flex-row flex-nowrap w-full h-full">
                <PanelGroup direction="horizontal">
                    <Panel>
                        <MonacoEditor
                            onChange={onTextInputHandler}
                            theme={theme}
                            language={lang}
                            className="w-full h-full"
                            value={code}
                            onMount={(editor) => {
                                const decs =
                                    editor.createDecorationsCollection();

                                editor.onDidChangeCursorSelection((e) => {
                                    socket.emit(SocketEvent.SET_SELECTION, {
                                        sessionId: session.id,
                                        userId: id,
                                        selection: {
                                            startColumn:
                                                e.selection.startColumn,
                                            startLineNumber:
                                                e.selection.startLineNumber,
                                            endColumn: e.selection.endColumn,
                                            endLineNumber:
                                                e.selection.endLineNumber,
                                        },
                                    });
                                });

                                editor.onDidChangeCursorPosition((e) => {
                                    socket.emit(
                                        SocketEvent.SEND_CURSOR_POSITION,
                                        {
                                            sessionId: session.id,
                                            userId: id,
                                            cursor: {
                                                column: e.position.column,
                                                lineNumber:
                                                    e.position.lineNumber,
                                            },
                                        },
                                    );
                                });
                                // @ts-expect-error - Property 'current' does not exist on type 'null'.
                                decorationsRef.current = decs;
                                updateCursors(
                                    cursorPositions,
                                    cursorSelections,
                                );
                            }}
                            beforeMount={(monaco) => {
                                editorRef.current = monaco;
                                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                                    {
                                        target: monaco.languages.typescript
                                            .ScriptTarget.ES2020,
                                        allowJs: true,
                                        checkJs: linting,
                                    },
                                );

                                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                                    {
                                        noSemanticValidation: !linting,
                                        noSyntaxValidation: !linting,
                                        noSuggestionDiagnostics: !linting,
                                        onlyVisible: !linting,
                                    },
                                );

                                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                                    {
                                        noSemanticValidation: !linting,
                                        noSyntaxValidation: !linting,
                                        onlyVisible: !linting,
                                        noSuggestionDiagnostics: !linting,
                                    },
                                );

                                monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                                    {
                                        allowJs: true,
                                        target: monaco.languages.typescript
                                            .ScriptTarget.ES2020,
                                        checkJs: linting,
                                    },
                                );

                                monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                                    {
                                        validate: linting,
                                        schemaValidation: linting
                                            ? "warning"
                                            : "ignore",
                                        enableSchemaRequest: linting,
                                    },
                                );

                                monaco.languages.css.cssDefaults.setOptions({
                                    validate: linting,
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
                                        unknownVendorSpecificProperties:
                                            "ignore",
                                        vendorPrefix: "ignore",
                                        zeroUnits: "ignore",
                                    },
                                });

                                monaco.languages.css.scssDefaults.setOptions({
                                    validate: linting,
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
                                        unknownVendorSpecificProperties:
                                            "ignore",
                                        vendorPrefix: "ignore",
                                        zeroUnits: "ignore",
                                    },
                                });

                                monaco.languages.css.lessDefaults.setOptions({
                                    validate: linting,
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
                                        unknownVendorSpecificProperties:
                                            "ignore",
                                        vendorPrefix: "ignore",
                                        zeroUnits: "ignore",
                                    },
                                });
                            }}
                            options={{
                                "semanticHighlighting.enabled": linting,
                                contextmenu: linting,
                                codeLens: linting,
                                automaticLayout: true,
                                theme,
                                minimap: { enabled: false },
                                hover: {
                                    enabled: linting,
                                    delay: 250,
                                },
                                suggest: {
                                    preview: linting,
                                    showWords: linting,
                                },
                                tabSize: 4,
                                quickSuggestions: {
                                    comments: linting,
                                    other: linting,
                                    strings: linting,
                                },
                                occurrencesHighlight: linting
                                    ? "singleFile"
                                    : "off",
                                showDeprecated: linting,
                                showUnused: linting,
                                showFoldingControls: "mouseover",
                                lightbulb: {
                                    // @ts-expect-error - Property 'enabled' does not exist on type 'boolean'.
                                    enabled: linting ? "on" : "off",
                                },
                                inlineSuggest: {
                                    enabled: linting,
                                },
                                inlayHints: {
                                    enabled: linting ? "on" : "off",
                                },
                                parameterHints: {
                                    enabled: linting,
                                },
                                wordBasedSuggestions: linting
                                    ? "currentDocument"
                                    : "off",
                                suggestOnTriggerCharacters: linting,
                                acceptSuggestionOnEnter: linting ? "on" : "off",
                                snippetSuggestions: linting
                                    ? undefined
                                    : "none",
                                renderValidationDecorations: linting
                                    ? "on"
                                    : "off",
                                tabCompletion: linting ? "on" : "off",
                                formatOnPaste: linting,
                                formatOnType: linting,
                                padding: { top: 16, bottom: 16 },
                                language: lang,
                            }}
                        />
                    </Panel>
                    <Solution
                        show={solutionPresented}
                        lang={lang}
                        solution={solution}
                        theme={theme}
                    />
                </PanelGroup>
            </div>
        </div>
    );
}
