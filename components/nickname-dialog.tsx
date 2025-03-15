import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { generateNickname } from "@/lib/random-name";

import { RefreshCw } from "lucide-react";
import { socket } from "./socket-provider";
import { ConnectedClient, SocketEvent } from "@/lib/definitions";
import { getId, getNickname } from "@/lib/id";

const id = getId();

export function NicknameDialog() {
    const [nickname, setNickname] = useState<string>(getNickname());
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function handleNickname(client: ConnectedClient) {
            if (client.userId === id) {
                setNickname(client.nickname);
            }
        }

        socket.on(SocketEvent.SET_NICKNAME, handleNickname);

        return () => {
            socket.off(SocketEvent.SET_NICKNAME, handleNickname);
        };
    }, []);

    function handleGenerateNickname() {
        const nick = generateNickname();
        setNickname(nick);
    }

    function handleSaveNickname() {
        if (
            typeof window === "undefined" ||
            typeof window.localStorage === "undefined"
        ) {
            return;
        }
        localStorage.setItem("nickname", nickname);
        socket.emit(SocketEvent.SET_NICKNAME, nickname);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" type="button">
                    {nickname}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nickname: {nickname}</DialogTitle>
                    <DialogDescription>Set your nickname</DialogDescription>
                </DialogHeader>
                <div className="flex flex-row flex-nowrap gap-4 items-center">
                    <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.currentTarget.value)}
                        type="text"
                    />
                    <Button type="button" onClick={handleGenerateNickname}>
                        <RefreshCw />
                    </Button>
                </div>
                <Button type="button" onClick={handleSaveNickname}>
                    Save
                </Button>
            </DialogContent>
        </Dialog>
    );
}
