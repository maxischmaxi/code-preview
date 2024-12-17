import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import classNames from 'classnames';
import { Cloud, CloudOff, MonitorUp } from 'lucide-react';
import { useEffect, useRef, useState, MouseEvent } from 'react';
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

const url = "http://localhost:5172";
const socket = io(url, {
  transports: ["websocket"],
});

type File = {
  name: string;
  language: string;
  value: string;
}

type ConnectedClient = {
  id: string;
  cursorPosition: CursorPosition;
  cursorSelection: monaco.Selection | null;
}

type CursorPosition = {
  lineNumber: number;
  column: number;
};

export function App() {
  const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newCode, setNewCode] = useState("");
  const decorationsCollectionRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.shiftKey && e.metaKey && e.key === ";") {
        setShowSettings((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKey)

    return () => {
      window.removeEventListener("keydown", handleKey);
    }
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    }
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
          c.cursorPosition.column
        ),
        options: {
          className: "cursor-decoration",
          after: {
            content: c.id,
          },
        }
      }))
    }

    function generateSelections() {
      return connectedClients.filter((c) => Boolean(c.cursorSelection)).map((c) => ({
        range: new monaco.Range(
          c.cursorSelection!.startLineNumber,
          c.cursorSelection!.startColumn,
          c.cursorSelection!.endLineNumber,
          c.cursorSelection!.endColumn,
        ),
        options: {
          className: "selection-decoration",
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      }))
    }

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.clear();
      decorationsCollectionRef.current.set([
        ...generateCursorPositions(),
        ...generateSelections()
      ]);
      return;
    }

    const collection = editorRef.current.createDecorationsCollection([
      ...generateCursorPositions(),
      ...generateSelections()
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
            }
          }

          return c;
        })
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
            }
          }

          return c;
        });
      })
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
    }
  }, []);

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
      })
    })

    editor.onDidChangeCursorSelection((e) => {
      socket.emit("cursorSelection", {
        ...e.selection.toJSON(),
      })
    })

    editor.getModel()?.onDidChangeContent((e) => {
      if (e.isFlush) {
        return;
      }

      socket.emit("change", e.changes)
    })

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
      })

    })
  }

  return (
    <div className="wrapper">
      <div id="editor" ref={editorWrapperRef} />
      <div className="statusbar">
        <div className={classNames(
          'statusbar-item',
          !isConnected && "disconnected"
        )} >
          {isConnected ? <Cloud /> : <CloudOff />}
        </div>
        <button
          type="button"
          onClick={doScreenshot}
          className="screenshot-button"
          title="Take Screenshot"
          aria-label="Take Screenshot"
        >
          <MonitorUp />
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
  )
}
