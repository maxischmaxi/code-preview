import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getApiGateway(): string {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:4000";
    }
    return `https://${process.env.NEXT_PUBLIC_API_GATEWAY}`;
}
