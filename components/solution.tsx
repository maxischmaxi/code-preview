import { Editor } from "@monaco-editor/react";
import { Panel, PanelResizeHandle } from "react-resizable-panels";

type Props = {
    solution: string;
    theme: string;
    lang: string;
    show: boolean;
};

export function Solution({ show, lang, theme, solution }: Props) {
    if (!show) return null;

    return (
        <>
            <PanelResizeHandle className="w-1 bg-secondary" />
            <Panel>
                <Editor
                    theme={theme}
                    beforeMount={(monaco) => {
                        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                            {
                                target: monaco.languages.typescript.ScriptTarget
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

                        monaco.languages.css.cssDefaults.setOptions({
                            validate: true,
                        });
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
    );
}
