import { ConnectedClient } from "@/lib/definitions";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { getId } from "@/lib/id";

type Props = {
    connectedClients: ConnectedClient[];
};

const id = getId();

export function Avatars({ connectedClients }: Props) {
    return (
        <div
            className="relative h-8"
            style={{ width: connectedClients.length * 30 }}
        >
            {connectedClients
                .sort((a, b) => {
                    if (a.userId === id) return -1;
                    if (b.userId === id) return 1;
                    return 0;
                })
                .map((client, index) => (
                    <Tooltip key={client.userId}>
                        <TooltipTrigger asChild>
                            <div
                                key={client.userId}
                                className={cn(
                                    "rounded-full w-8 h-8 border flex justify-center items-center absolute top-0 left-0 bg-background",
                                    id === client.userId && "border-amber-400",
                                )}
                                style={{
                                    transform: `translateX(${index * 20}px)`,
                                }}
                            >
                                {client.nickname.length > 0
                                    ? client.nickname[0].toUpperCase()
                                    : "U"}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {client.nickname || "Unknown User"}
                        </TooltipContent>
                    </Tooltip>
                ))}
        </div>
    );
}
