import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import classNames from "classnames";
import { Cloud, CloudOff, Loader, MonitorUp } from "lucide-react";
import { useEffect, useRef, useState, MouseEvent } from "react";
import { io } from "socket.io-client";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import "monaco-editor/esm/vs/basic-languages/php/php.contribution";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution";
import { useTheme } from "./hooks/useTheme";
import { useQueryGetSession } from "./hooks/useQueryGetSession";
import { useParams } from "react-router";

const url = "http://localhost:5172";
const socket = io(url, {
  transports: ["websocket"],
});

type File = {
  name: string;
  language: string;
  value: string;
};

type ConnectedClient = {
  id: string;
  cursorPosition: CursorPosition;
  cursorSelection: monaco.Selection | null;
};

type CursorPosition = {
  lineNumber: number;
  column: number;
};

export function App() {
  const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
    [],
  );
  const { id = "" } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newCode, setNewCode] = useState("");
  const decorationsCollectionRef =
    useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const session = useQueryGetSession(id);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.shiftKey && e.metaKey && e.key === ";") {
        setShowSettings((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    function generateCursorPositions() {
      return connectedClients.map((c) => ({
        range: new monaco.Range(
          c.cursorPosition.lineNumber,
          c.cursorPosition.column,
          c.cursorPosition.lineNumber,
          c.cursorPosition.column,
        ),
        options: {
          className: "cursor-decoration",
          after: {
            content: c.id,
          },
        },
      }));
    }

    function generateSelections() {
      return connectedClients
        .filter((c) => Boolean(c.cursorSelection))
        .map((c) => ({
          range: new monaco.Range(
            c.cursorSelection!.startLineNumber,
            c.cursorSelection!.startColumn,
            c.cursorSelection!.endLineNumber,
            c.cursorSelection!.endColumn,
          ),
          options: {
            className: "selection-decoration",
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        }));
    }

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.clear();
      decorationsCollectionRef.current.set([
        ...generateCursorPositions(),
        ...generateSelections(),
      ]);
      return;
    }

    const collection = editorRef.current.createDecorationsCollection([
      ...generateCursorPositions(),
      ...generateSelections(),
    ]);
    decorationsCollectionRef.current = collection;
  }, [connectedClients]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onChange(data: File) {
      editorRef.current?.setValue(data.value);
    }

    function onCursorPosition(client: ConnectedClient) {
      setConnectedClients((prev) => {
        const index = prev.findIndex((c) => c.id === client.id);

        if (index === -1) {
          return [...prev, client];
        }

        return prev.map((c, i) => {
          if (i === index) {
            return {
              ...c,
              cursorPosition: client.cursorPosition,
            };
          }

          return c;
        });
      });
    }

    function onCursorSelection(client: ConnectedClient) {
      setConnectedClients((prev) => {
        const index = prev.findIndex((c) => c.id === client.id);

        if (index === -1) {
          return [...prev, client];
        }

        return prev.map((c, i) => {
          if (i === index) {
            return {
              ...c,
              cursorSelection: client.cursorSelection,
            };
          }

          return c;
        });
      });
    }

    function onClientDisconnected(clientId: string) {
      setConnectedClients((prev) => prev.filter((c) => c.id !== clientId));
    }

    socket.emit("getCursorPositions");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("cursorPosition", onCursorPosition);
    socket.on("change", onChange);
    socket.on("cursorSelection", onCursorSelection);
    socket.on("clientDisconnected", onClientDisconnected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("cursorPosition", onCursorPosition);
      socket.off("change", onChange);
      socket.off("cursorSelection", onCursorSelection);
      socket.off("clientDisconnected", onClientDisconnected);
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      editorRef.current.updateOptions({
        theme: systemTheme === "dark" ? "vs-dark" : "vs",
      });
    } else {
      editorRef.current.updateOptions({
        theme: theme === "dark" ? "vs-dark" : "vs",
      });
    }
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      return;
    }

    const element = document.getElementById("editor");

    if (!element) {
      return;
    }

    const editor = monaco.editor.create(element, {
      value: "",
      language: "typescript",
      automaticLayout: true,
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
    });

    editor.onDidChangeCursorPosition((e) => {
      socket.emit("cursorPosition", {
        ...e.position.toJSON(),
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      socket.emit("cursorSelection", {
        ...e.selection.toJSON(),
      });
    });

    editor.getModel()?.onDidChangeContent((e) => {
      if (e.isFlush) {
        return;
      }

      socket.emit("change", e.changes);
    });

    editorRef.current = editor;
  }, []);

  function replaceText() {
    socket.emit("replaceText", newCode);
    setShowSettings(false);
  }

  function onClose() {
    setShowSettings(false);
  }

  function onStopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  function onInput(e: React.FormEvent<HTMLDivElement>) {
    setNewCode(e.currentTarget.textContent || "");
  }

  async function doScreenshot() {
    if (!editorWrapperRef.current) {
      return;
    }

    import("html2canvas").then((html2canvas) => {
      if (!editorWrapperRef.current) {
        return;
      }

      html2canvas.default(editorWrapperRef.current).then((canvas) => {
        const img = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = img;
        a.download = "code_screenshot_" + Date.now() + ".png";
        a.click();
      });
    });
  }

  return (
    <div className="relative h-full flex flex-col w-full justify-center items-center">
      <div id="editor" className="w-full h-full" ref={editorWrapperRef} />
      <div className="w-full h-[16px] bg-background max-h-[16px] overflow-hidden flex flex-row flex-nowrap px-2">
        <div
          className={classNames(
            "w-4 h-4 flex justify-center items-center text-[#61e058]",
            !isConnected && "text-[#ff3b3b]",
          )}
        >
          {isConnected ? (
            <Cloud className="w-3 h-3" />
          ) : (
            <CloudOff className="w-3 h-3" />
          )}
        </div>
        <button
          type="button"
          onClick={doScreenshot}
          className="m-0 p-0 text-white w-4 h-4 flex justify-center items-center flex-row ml-auto bg-transparent border-none"
          title="Take Screenshot"
          aria-label="Take Screenshot"
        >
          <MonitorUp className="w-3 h-3" />
        </button>
      </div>
      {showSettings && (
        <div className="backdrop" onClick={onClose}>
          <div className="modal" onClick={onStopPropagation}>
            <div className="modal-header">
              <h2>Settings</h2>
            </div>
            <div className="modal-content">
              <p>Code ersetzen</p>
              <div
                className="replace-box"
                contentEditable
                suppressContentEditableWarning
                autoFocus
                onInput={onInput}
              />
              <button
                type="button"
                onClick={replaceText}
                aria-label="Text ersetzen"
                title="Text ersetzen"
              >
                Text ersetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
