import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import classNames from 'classnames';
import { Cloud, CloudOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

const url = "http://server:3000";
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
  const decorationsCollectionRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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

  return (
    <div className="wrapper">
      <div id="editor" />
      <div className="statusbar">
        <div className={classNames(
          'statusbar-item',
          !isConnected && "disconnected"
        )} >
          {isConnected ? <Cloud /> : <CloudOff />}
        </div>
      </div>
    </div>
  )
}
