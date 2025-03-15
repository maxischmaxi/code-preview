"use client";

import { GradientChangingText } from "@/components/gradient-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateNickname } from "@/lib/random-name";
import { getNickname } from "@/lib/id";

const createSessionForm = z.object({
    nickname: z
        .string({
            message: "Nickname is required",
        })
        .min(3, { message: "Nickname is required" })
        .max(50, { message: "Nickname is too long" }),
});

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof createSessionForm>>({
        resolver: zodResolver(createSessionForm),
        defaultValues: {
            nickname: getNickname(),
        },
        disabled: loading,
    });

    function createSession(data: z.infer<typeof createSessionForm>) {
        setLoading(true);
        if (
            typeof window === "undefined" ||
            typeof window.localStorage === "undefined"
        ) {
            return;
        }
        localStorage.setItem("nickname", data.nickname);
        api.session
            .createSession(data.nickname)
            .then((session) => {
                router.push(`/${session.id}`);
            })
            .catch(() => {
                toast("Failed to create session");
                setLoading(false);
            });
    }

    function getGenreatedNickname() {
        const randomName = generateNickname();
        form.setValue("nickname", randomName);
        form.trigger("nickname");
    }

    return (
        <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
            <GradientChangingText className="text-6xl">
                Welcome to <strong>CodeShare</strong>
            </GradientChangingText>
            <p>
                Share code with anyone in real-time. No sign-up required. Just
                create a session and share the link.
            </p>
            <form
                className="flex flex-col gap-4 w-full max-w-md"
                onSubmit={form.handleSubmit(createSession)}
            >
                <div className="flex flex-row flex-nowrap gap-4">
                    <Controller
                        name="nickname"
                        control={form.control}
                        render={({ field, fieldState: { error } }) => (
                            <div className="flex flex-col flex-nowrap gap-1 w-full">
                                <Input
                                    type="text"
                                    placeholder="Nickname"
                                    {...field}
                                />
                                {error && (
                                    <p className="text-destructive text-xs">
                                        {error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                onClick={getGenreatedNickname}
                            >
                                <RefreshCw />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Generate a random nickname
                        </TooltipContent>
                    </Tooltip>
                </div>

                <Button loading={loading} disabled={loading} type="submit">
                    Create Session
                </Button>
            </form>
        </div>
    );
}
