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
import { Monaco, Editor as MonacoEditor } from "@monaco-editor/react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";
import { ModeToggle } from "./mode-toggle";
import {
    CodeIcon,
    Copy,
    Plus,
    Presentation,
    Settings,
    Users,
} from "lucide-react";
import { Button } from "./ui/button";
import {
    ConnectedClient,
    CursorPosition,
    Session,
    SocketEvent,
    Template,
} from "@/lib/definitions";
import { getId } from "@/lib/id";
import { useEditorTheme } from "@/hooks/useEditorTheme";
import { socket, SocketContext } from "./socket-provider";
import { TemplateDialog } from "./template-dialog";
import { UserPanel } from "./user-panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NewTemplateDialog } from "./new-template-dialog";
import { cn } from "@/lib/utils";

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
    const [clients, setClients] = useState<ConnectedClient[]>([]);
    const [showConfigMenu, setShowConfigMenu] = useState(false);
    const [admins, setAdmins] = useState<string[]>(session.admins);
    const [showSolution, setShowSolution] = useState(id === session.createdBy);
    const [showUsers, setShowUsers] = useState(false);
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
    const [solutionPresented, setSolutionPresented] = useState(
        session.solutionPresented,
    );
    const editorRef = useRef<Monaco | null>(null);
    const decorationsRef = useRef(null);
    const [cursorPositions, setCursorPositions] = useState<
        Array<Omit<CursorPosition, "sessionId">>
    >([]);

    const updateCursors = useCallback(
        (positions: Array<Omit<CursorPosition, "sessionId">>) => {
            if (!editorRef.current) {
                return;
            }
            if (!decorationsRef.current) {
                return;
            }

            const newDecorations = positions
                .map((cursor) => {
                    if (!editorRef.current) {
                        return null;
                    }

                    return {
                        range: new editorRef.current.Range(
                            cursor.cursor.lineNumber,
                            cursor.cursor.column,
                            cursor.cursor.lineNumber,
                            cursor.cursor.column,
                        ),
                        options: {
                            className: "multi-cursor",
                            inWholeLine: false,
                            afterContentClassName: admins.includes(
                                cursor.userId,
                            )
                                ? "cursor-label-admin"
                                : "cursor-label-default",
                        },
                    };
                })
                .filter(Boolean);

            // @ts-expect-error - Property 'set' does not exist on type 'DecorationsCollection'.
            decorationsRef.current.set(newDecorations);
        },
        [admins],
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
        updateCursors(cursorPositions);
    }, [cursorPositions, updateCursors]);

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

        function onCursorPositionHandler(data: CursorPosition) {
            setCursorPositions((prev) => {
                const index = prev.findIndex(
                    (cursor) => cursor.userId === data.userId,
                );

                if (index === -1) {
                    return [...prev, data];
                }

                return prev.map((cursor) =>
                    cursor.userId === data.userId ? data : cursor,
                );
            });
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

    function setTemplate(templateId: string) {
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

        setCode(template.code);
        setLang(template.language);
        setSolution(template.solution);
        setSolutionPresented(false);
        setShowConfigMenu(false);
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

    function presentSolution() {
        setSolutionPresented(true);
        socket.emit(SocketEvent.SOLUTION_PRESENTED, {
            sessionId: session.id,
            userId: id,
        });
    }

    return (
        <div className="w-full h-full flex flex-col flex-nowrap">
            <header className="p-4 flex flex-row flex-nowrap justify-between items-center border-b">
                <Badge className="cursor-pointer" onClick={copyToClipboard}>
                    {session.id}
                    <Copy />
                </Badge>
                <div className="flex flex-row flex-nowrap gap-4 items-center">
                    <div className="flex justify-center items-center py-2">
                        <Badge variant="outline">{clients.length}</Badge>
                    </div>
                    {(id === session.createdBy || admins.includes(id)) && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={
                                            solutionPresented
                                                ? "secondary"
                                                : "outline"
                                        }
                                        disabled={solutionPresented}
                                        className={cn(
                                            solutionPresented && "bg-amber-600",
                                        )}
                                        onClick={presentSolution}
                                    >
                                        <Presentation />
                                    </Button>
                                </TooltipTrigger>
                            </Tooltip>
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
                            language={lang}
                            className="w-full h-full"
                            value={code}
                            onMount={(editor) => {
                                const decs =
                                    editor.createDecorationsCollection();

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
                                updateCursors(cursorPositions);
                            }}
                            beforeMount={(monaco) => {
                                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                                    {
                                        target: monaco.languages.typescript
                                            .ScriptTarget.ES2020,
                                        allowJs: true,
                                        checkJs: false,
                                    },
                                );

                                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                                    {
                                        noSemanticValidation: true,
                                        noSyntaxValidation: true,
                                        noSuggestionDiagnostics: true,
                                        onlyVisible: true,
                                    },
                                );

                                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                                    {
                                        noSemanticValidation: true,
                                        noSyntaxValidation: true,
                                        onlyVisible: true,
                                        noSuggestionDiagnostics: true,
                                    },
                                );

                                monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                                    {
                                        allowJs: true,
                                        target: monaco.languages.typescript
                                            .ScriptTarget.ES2020,
                                        checkJs: false,
                                    },
                                );

                                monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                                    {
                                        validate: false,
                                        schemaValidation: "ignore",
                                        enableSchemaRequest: false,
                                    },
                                );

                                monaco.languages.css.cssDefaults.setOptions({
                                    validate: false,
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
                                    validate: false,
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
                                    validate: false,
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
                                "semanticHighlighting.enabled": false,
                                contextmenu: false,
                                codeLens: false,
                                automaticLayout: true,
                                theme,
                                minimap: { enabled: false },
                                hover: {
                                    enabled: false,
                                    delay: 250,
                                },
                                suggest: {
                                    preview: false,
                                    showWords: false,
                                },
                                tabSize: 4,
                                quickSuggestions: {
                                    comments: false,
                                    other: false,
                                    strings: false,
                                },
                                occurrencesHighlight: "off",
                                showDeprecated: false,
                                showUnused: false,
                                showFoldingControls: "mouseover",
                                lightbulb: {
                                    // @ts-expect-error - Property 'enabled' does not exist on type 'boolean'.
                                    enabled: "off",
                                },
                                inlineSuggest: {
                                    enabled: false,
                                },
                                inlayHints: {
                                    enabled: "off",
                                },
                                parameterHints: {
                                    enabled: false,
                                },
                                wordBasedSuggestions: false
                                    ? "currentDocument"
                                    : "off",
                                suggestOnTriggerCharacters: false,
                                acceptSuggestionOnEnter: false ? "on" : "off",
                                snippetSuggestions: "none",
                                renderValidationDecorations: "off",
                                tabCompletion: "off",
                                formatOnPaste: false,
                                formatOnType: false,
                                padding: { top: 16, bottom: 16 },
                                language: lang,
                            }}
                        />
                    </Panel>
                    {(showSolution || solutionPresented) && (
                        <>
                            <PanelResizeHandle className="w-1 bg-secondary" />
                            <Panel>
                                <MonacoEditor
                                    theme={theme}
                                    beforeMount={(monaco) => {
                                        editorRef.current = monaco;
                                        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                                            {
                                                target: monaco.languages
                                                    .typescript.ScriptTarget
                                                    .ES2020,
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

                                        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                                            {
                                                validate: true,
                                            },
                                        );

                                        monaco.languages.css.cssDefaults.setOptions(
                                            {
                                                validate: true,
                                            },
                                        );
                                    }}
                                    className="w-full h-full"
                                    value={solution}
                                    language={lang}
                                    options={{
                                        "semanticHighlighting.enabled": true,
                                        contextmenu: true,
                                        codeLens: true,
                                        automaticLayout: true,
                                        hover: {
                                            enabled: true,
                                            delay: 250,
                                        },
                                        suggest: {
                                            preview: true,
                                            showWords: true,
                                        },
                                        tabSize: 4,
                                        quickSuggestions: {
                                            comments: true,
                                            other: true,
                                            strings: true,
                                        },
                                        parameterHints: {
                                            enabled: true,
                                        },
                                        wordBasedSuggestions: "currentDocument",
                                        suggestOnTriggerCharacters: true,
                                        acceptSuggestionOnEnter: "on",
                                        tabCompletion: "on",
                                        formatOnPaste: false,
                                        formatOnType: false,
                                        theme,
                                        language: lang,
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
                                    connectedClients={clients}
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
            <TemplateDialog
                open={showConfigMenu}
                templates={templates}
                selectTemplate={setTemplate}
                setOpen={setShowConfigMenu}
            />
        </div>
    );
}
