import { Server } from "socket.io";
import { createServer } from "http";

type CursorPosition = {
  lineNumber: number;
  column: number;
};

type File = {
  name: string;
  language: string;
  value: string;
};

type Change = {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  rangeLength: number;
  text: string;
  rangeOffset: number;
  forceMoveMarkers: boolean;
};

type CursorSelection = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  selectionStartLineNumber: number;
  selectionStartColumn: number;
  positionLineNumber: number;
  positionColumn: number;
};

type ConnectedClient = {
  id: string;
  cursorPosition: CursorPosition;
  cursorSelection: CursorSelection | null;
};

const connectedClients: ConnectedClient[] = [];
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const file: File = {
  name: "index.ts",
  language: "typescript",
  value: `
import React from 'react';
import ReactDOM from 'react-dom';

import Editor, { useMonaco } from '@monaco-editor/react';

function App() {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      console.log('here is the monaco instance:', monaco);
    }
  }, [monaco]);

  return <Editor height="90vh" defaultValue="// some comment" defaultLanguage="javascript" />;
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
`,
};

io.on("connection", (socket) => {
  console.log(socket.id + " connected");
  socket.emit("change", file);

  connectedClients.push({
    id: socket.id,
    cursorPosition: {
      lineNumber: 1,
      column: 1,
    },
    cursorSelection: null,
  });

  socket.on("change", (changes: Array<Change>) => {
    const newValue = file.value;
    for (const change of changes) {
      const start = newValue.substring(0, change.rangeOffset);
      const end = newValue.substring(change.rangeOffset + change.rangeLength);
      file.value = start + change.text + end;
    }

    for (let i = 0; i < connectedClients.length; i++) {
      if (connectedClients[i].id !== socket.id) {
        socket.to(connectedClients[i].id).emit("change", file);
      }
    }
  });

  socket.on("getCursorPositions", () => {
    const positions = connectedClients.filter(
      (client) => client.id !== socket.id,
    );

    socket.emit("cursorPositions", positions);
  });

  socket.on("cursorSelection", (selection: CursorSelection) => {
    for (let i = 0; i < connectedClients.length; i++) {
      if (connectedClients[i].id === socket.id) {
        connectedClients[i].cursorSelection = selection;
      } else {
        socket.to(connectedClients[i].id).emit("cursorSelection", {
          id: socket.id,
          cursorSelection: selection,
          cursorPosition: connectedClients[i].cursorPosition,
        });
      }
    }
  });

  socket.on("cursorPosition", (cursorPosition: CursorPosition) => {
    for (let i = 0; i < connectedClients.length; i++) {
      if (connectedClients[i].id === socket.id) {
        connectedClients[i].cursorPosition = cursorPosition;
      } else {
        socket.to(connectedClients[i].id).emit("cursorPosition", {
          id: socket.id,
          cursorPosition,
          cursorSelection: connectedClients[i].cursorSelection,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
    const index = connectedClients.findIndex(
      (client) => client.id === socket.id,
    );
    connectedClients.splice(index, 1);
    socket.broadcast.emit("clientDisconnected", socket.id);
  });

  socket.on("error", (error) => {
    console.log(error);
  });
});

io.on("error", (error) => {
  console.log(error);
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
