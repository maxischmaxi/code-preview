"use client";

import { ConnectedClient, Session } from "@/lib/definitions";
import { Button } from "./ui/button";
import { ShieldOff, ShieldUser } from "lucide-react";
import { Badge } from "./ui/badge";
import { getId } from "@/lib/id";

type Props = {
    connectedClients: ConnectedClient[];
    session: Session;
    toggleUserAdmin: (client: ConnectedClient) => void;
    admins: string[];
};

const id = getId();

export function UserPanel({
    admins,
    session,
    connectedClients,
    toggleUserAdmin,
}: Props) {
    return (
        <ul>
            <li className="px-4 py-2 flex flex-row flex-nowrap justify-between items-center">
                {id === session.createdBy && <p>You</p>}
                <Badge variant="outline">Host</Badge>
            </li>
            {connectedClients
                .filter((c) => c.userId !== session.createdBy)
                .map((client) => (
                    <li
                        key={client.userId}
                        className="px-4 py-2 flex flex-row flex-nowrap justify-between items-center"
                    >
                        <p>User</p>
                        {client.userId !== session.createdBy && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUserAdmin(client)}
                            >
                                {admins.includes(client.userId) ? (
                                    <ShieldUser />
                                ) : (
                                    <ShieldOff />
                                )}
                            </Button>
                        )}
                    </li>
                ))}
        </ul>
    );
}
