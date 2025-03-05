"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Session } from "@/lib/definitions";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const createSession = useMutation({
        async mutationFn() {
            return await api.session.createSession();
        },
        onSuccess(session: Session) {
            router.push(`/${session.id}`);
        },
    });

    return (
        <div className="w-full h-full flex justify-center items-center">
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
