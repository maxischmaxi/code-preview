"use client";

import { GradientChangingText } from "@/components/gradient-text";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    function createSession() {
        setLoading(true);
        api.session
            .createSession()
            .then((session) => {
                router.push(`/${session.id}`);
            })
            .catch(() => {
                toast("Failed to create session");
            })
            .finally(() => {
                setLoading(false);
            });
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
            <Button
                loading={loading}
                disabled={loading}
                onClick={createSession}
            >
                New Session
            </Button>
        </div>
    );
}
