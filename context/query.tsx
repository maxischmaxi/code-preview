"use client";

import { QueryClient, QueryClientProvider as QCP } from "@tanstack/react-query";
import { ReactNode } from "react";

const client = new QueryClient();

export function QueryClientProvider({ children }: { children?: ReactNode }) {
    return <QCP client={client}>{children}</QCP>;
}
