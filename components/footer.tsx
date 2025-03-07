import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function Footer() {
    return (
        <footer className="flex flex-row justify-center items-center flex-nowrap p-3 border-t">
            <Link
                href="/"
                className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "hover:underline",
                )}
            >
                Home
            </Link>
            <Link
                href="/imprint"
                className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "hover:underline",
                )}
                title="Imprint"
            >
                Imprint
            </Link>
            <Link
                className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "hover:underline",
                )}
                title="Privacy Policy"
                href="/privacy-policy"
            >
                Privacy Policy
            </Link>
            <Link
                className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "hover:underline",
                )}
                title="Github"
                href="https://github.com/maxischmaxi"
                target="_blank"
            >
                Github
            </Link>
        </footer>
    );
}
