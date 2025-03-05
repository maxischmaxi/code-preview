"use client";

import { GradientChangingText } from "@/components/gradient-text";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Session } from "@/lib/definitions";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
    const router = useRouter();

    const createSession = useMutation({
        async mutationFn() {
            return await api.session.createSession();
        },
        onSuccess(session: Session) {
            router.push(`/${session.id}`);
        },
        onError() {
            toast("Failed to create session");
        },
    });

    return (
        <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
            <GradientChangingText className="text-6xl">
                Welcome to <strong>CodeShare</strong>
            </GradientChangingText>
            <p>
                Share code with anyone in real-time. No sign-up required. Just
                create a session and share the link.
            </p>
            <Button
                loading={createSession.isPending}
                disabled={createSession.isPending}
                onClick={async () => {
                    await createSession.mutateAsync();
                }}
            >
                New Session
            </Button>
        </div>
    );
}
