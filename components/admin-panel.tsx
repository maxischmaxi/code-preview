import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Plus, Settings, ShieldUser, ShieldX, User } from "lucide-react";
import {
    ConnectedClient,
    Session,
    SocketEvent,
    Template,
} from "@/lib/definitions";
import { useState } from "react";
import { EditTemplateDialog } from "./edit-template-dialog";
import { toast } from "sonner";
import { socket } from "./socket-provider";
import { getId } from "@/lib/id";
import { NewTemplateDialog } from "./new-template-dialog";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
    isAdmin: boolean;
    templates: Template[];
    setCode: (code: string) => void;
    setLang: (lang: string) => void;
    setSolution: (solution: string) => void;
    setSolutionPresented: (presented: boolean) => void;
    solutionPresented: boolean;
    session: Session;
    connectedClients: ConnectedClient[];
    admins: string[];
    makeUserAdmin: (client: ConnectedClient) => void;
    makeUserNotAdmin: (client: ConnectedClient) => void;
};

const id = getId();

export function AdminPanel({
    isAdmin,
    templates,
    setCode,
    setLang,
    setSolution,
    setSolutionPresented,
    session,
    solutionPresented,
    connectedClients,
    admins,
    makeUserAdmin,
    makeUserNotAdmin,
}: Props) {
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );

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
    }

    return (
        <>
            {isAdmin && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button type="button" variant="outline">
                            <Settings />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Admin Panel</SheetTitle>
                            <SheetDescription>
                                Manage session settings
                            </SheetDescription>
                        </SheetHeader>
                        <label className="flex flex-row flex-nowrap items-center px-4">
                            <Switch
                                checked={solutionPresented}
                                onCheckedChange={setSolutionPresented}
                            />
                            <span className="text-sm text-secondary-foreground px-4">
                                Presenting the solution
                            </span>
                        </label>
                        <p className="text-sm text-secondary-foreground px-4">
                            Select a template to set the code and language for
                            the session.
                        </p>
                        <ul className="flex flex-col flex-nowrap gap-2 overflow-y-auto max-h-[500px] px-4">
                            {templates.map((template, index) => (
                                <li
                                    key={index}
                                    className="flex flex-row flex-nowrap max-w-full w-full justify-between gap-4"
                                >
                                    <Button
                                        key={index}
                                        variant="outline"
                                        type="button"
                                        size="sm"
                                        className="w-[80%]"
                                        onClick={() => setTemplate(template.id)}
                                    >
                                        {template.title}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setShowEditDialog(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </li>
                            ))}
                            <li>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() =>
                                        setShowNewTemplateDialog(true)
                                    }
                                >
                                    <Plus />
                                </Button>
                            </li>
                        </ul>
                        <ul>
                            <li className="px-4 py-2 flex flex-row flex-nowrap gap-4 justify-start items-center">
                                <User />
                                <p className="text-xs">You</p>
                                {session.createdBy === id && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto"
                                    >
                                        Host
                                    </Badge>
                                )}
                            </li>
                            {connectedClients
                                .filter((c) => c.userId !== id)
                                .map((client) => (
                                    <li
                                        key={client.userId}
                                        className="px-4 py-2 gap-4 flex flex-row flex-nowrap justify-start items-center"
                                    >
                                        <User />
                                        <p className="text-xs">
                                            {client.nickname}
                                        </p>
                                        {session.createdBy === id && (
                                            <>
                                                {admins.includes(
                                                    client.userId,
                                                ) ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                className="ml-auto"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => {
                                                                    makeUserNotAdmin(
                                                                        client,
                                                                    );
                                                                }}
                                                            >
                                                                <ShieldX />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Demote Admin
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                className="ml-auto"
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    makeUserAdmin(
                                                                        client,
                                                                    )
                                                                }
                                                            >
                                                                <ShieldUser />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Make Admin
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </>
                                        )}
                                    </li>
                                ))}
                        </ul>
                    </SheetContent>
                </Sheet>
            )}
            {selectedTemplate && (
                <EditTemplateDialog
                    open={showEditDialog}
                    setOpen={setShowEditDialog}
                    template={selectedTemplate}
                />
            )}
            <NewTemplateDialog
                open={showNewTemplateDialog}
                setOpen={setShowNewTemplateDialog}
            />
        </>
    );
}
