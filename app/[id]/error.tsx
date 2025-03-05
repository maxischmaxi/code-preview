"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Error() {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-8">
            <p>
            Sorry, something went wrong. Please try again later.
            </p>
            <Link className={buttonVariants({ variant: "default" })} href="/">
                Go back
            </Link>
        </div>
    )
}
