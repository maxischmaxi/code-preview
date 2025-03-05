"use client";
import { motion } from "framer-motion";

import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
};

export function GradientChangingText({ children, className }: Props) {
    return (
        <motion.span
            animate={{
                background: [
                    "-webkit-linear-gradient(81deg, rgba(181,0,255,1) 0%, rgba(255,112,112,1) 59%, rgba(255,0,0,1) 100%)",
                    "-webkit-linear-gradient(81deg, rgba(255,76,76,1) 0%, rgba(254,218,92,1) 59%, rgba(187,255,0,1) 100%)",
                    "-webkit-linear-gradient(81deg, rgba(164,76,255,1) 0%, rgba(92,97,254,1) 59%, rgba(34,48,255,1) 100%)",
                ],
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
            }}
            className={className}
        >
            {children}
        </motion.span>
    );
}
