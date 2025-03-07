"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { getApiGateway } from "@/lib/utils";
import { toast } from "sonner";
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
};

export function NewTemplateDialog({ open, setOpen }: Props) {
    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [solution, setSolution] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [loading, setLoading] = useState(false);

    function createTemplate() {
        setLoading(true);
        fetch(`${getApiGateway()}/template`, {
            method: "POST",
            body: JSON.stringify({
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
                    toast("Failed to create template");
                    return;
                }

                toast("Template created");
            })
            .catch(() => {
                toast("Failed to create template");
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
                    <DialogTitle>New Template</DialogTitle>
                    <DialogDescription>Create a new template</DialogDescription>
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
                        onClick={createTemplate}
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
