"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Template } from "@/lib/definitions";
import { EditTemplateDialog } from "./edit-template-dialog";

type Props = {
    open: boolean;
    templates: Template[];
    setOpen: Dispatch<SetStateAction<boolean>>;
    selectTemplate: (id: string) => void;
    disableLinting: () => void;
    enableLinting: () => void;
    lintingEnabled: boolean;
};

export function ConfigMenuDialog({
    templates,
    enableLinting,
    disableLinting,
    lintingEnabled,
    open,
    setOpen,
    selectTemplate,
}: Props) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Config</DialogTitle>
                        <DialogDescription>
                            Here you can configure the editor
                        </DialogDescription>
                    </DialogHeader>
                    <p>Templates</p>
                    <ul className="flex flex-col flex-nowrap gap-2 overflow-y-auto max-h-[500px]">
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
                                    onClick={() => selectTemplate(template.id)}
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
                    </ul>
                    <p>Linting: {lintingEnabled ? "Enabled" : "Disabled"}</p>
                    <div className="flex flex-row flex-nowrap gap-4">
                        <Button
                            onClick={enableLinting}
                            type="button"
                            variant={lintingEnabled ? "secondary" : "outline"}
                        >
                            Enable
                        </Button>
                        <Button
                            onClick={disableLinting}
                            type="button"
                            variant={!lintingEnabled ? "secondary" : "outline"}
                        >
                            Disable
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {selectedTemplate && (
                <EditTemplateDialog
                    open={showEditDialog}
                    setOpen={setShowEditDialog}
                    template={selectedTemplate}
                />
            )}
        </>
    );
}
