"use client";

import { Template } from "@/lib/definitions";
import { getApiGateway } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    template: Template;
};

export function EditTemplateDialog({ open, setOpen, template }: Props) {
    const [title, setTitle] = useState(template.title);
    const [code, setCode] = useState(template.code);
    const [solution, setSolution] = useState(template.solution);
    const [language, setLanguage] = useState(template.language);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTitle(template.title);
        setCode(template.code);
        setSolution(template.solution);
        setLanguage(template.language);
    }, [template]);

    function updateTemplate() {
        setLoading(true);
        fetch(`${getApiGateway()}/template`, {
            method: "PATCH",
            body: JSON.stringify({
                id: template.id,
                title,
                code,
                solution,
                language,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok || res.status !== 200) {
                    toast("Failed to update template");
                    return;
                }

                toast("Template updated");
            })
            .catch(() => {
                toast("Failed to update template");
            })
            .finally(() => {
                setOpen(false);
                setLoading(false);
                setCode("");
                setSolution("");
                setTitle("");
                setLanguage("javascript");
            });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {title}</DialogTitle>
                    <DialogDescription>
                        Edit the template to update the title, code, solution,
                        and language.
                    </DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        disabled={loading}
                        type="text"
                        placeholder="Title"
                    />
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.currentTarget.value)}
                        disabled={loading}
                        placeholder="Code"
                        className="max-h-[200px]"
                    />
                    <Textarea
                        value={solution}
                        onChange={(e) => setSolution(e.currentTarget.value)}
                        disabled={loading}
                        placeholder="Solution"
                        className="max-h-[200px]"
                    />
                    <Select
                        value={language}
                        onValueChange={setLanguage}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">
                                JavaScript
                            </SelectItem>
                            <SelectItem value="typescript">
                                TypeScript
                            </SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                            <SelectItem value="php">PHP</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="submit"
                        onClick={updateTemplate}
                        loading={loading}
                        disabled={loading}
                    >
                        Create
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
