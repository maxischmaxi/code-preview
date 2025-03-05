"use client";

import { editor } from "monaco-editor";
import loader from "@monaco-editor/loader";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import "monaco-editor/esm/vs/basic-languages/php/php.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

type IUseMonaco = {
    editor: typeof editor | null;
};
export const MonacoContext = createContext<IUseMonaco>({
    editor: null,
});

export function MonacoProvider({ children }: { children?: ReactNode }) {
    const [ready, setReady] = useState(false);
    const monaco = useRef<typeof editor | null>(null);

    useEffect(() => {
        let cancel = false;

        loader.init().then((monacoInstance) => {
            if (cancel) {
                return;
            }

            monaco.current = monacoInstance.editor;
            setReady(true);
        });

        return function () {
            cancel = true;
        };
    }, []);

    if (!ready) {
        return null;
    }

    return (
        <MonacoContext.Provider value={{ editor: monaco.current }}>
            {children}
        </MonacoContext.Provider>
    );
}
