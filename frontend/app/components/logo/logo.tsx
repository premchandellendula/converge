import React, { useEffect } from "react";

type ConvergeLogoProps = {
    variant?: "full" | "mark" | "wordmark";
    size?: number;
    accent?: string;
    href?: string;
    className?: string;
    style?: React.CSSProperties;
};

const FONT_URL = "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..900&display=swap";

function useGoogleSansFlex() {
    useEffect(() => {
        if (document.querySelector(`link[href="${FONT_URL}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_URL;
        document.head.appendChild(link);
    }, []);
}

function Mark({ accent }: { accent: string }) {
    return (
        <svg
            viewBox="0 0 25.4 20"
            fill="none"
            aria-hidden="true"
            focusable="false"
            width="0.92em"
            height="0.72em"
            style={{
                display: "block",
                flexShrink: 0,
                height: "1cap",
                width: "1.27cap",
                overflow: "visible",
            }}
        >
            <path
                d="M1.5 1.5C9.5 1.5 10.5 10 19.5 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <path
                d="M1.5 18.5C9.5 18.5 10.5 10 19.5 10"
                stroke={accent}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle cx="22.4" cy="10" r="3" fill={accent} />
        </svg>
    );
}

export default function ConvergeLogo({
    variant = "full",
    size = 26,
    accent = "#2563EB",
    href,
    className,
    style,
}: ConvergeLogoProps) {
    useGoogleSansFlex();

    const showMark = variant === "full" || variant === "mark";
    const showText = variant === "full" || variant === "wordmark";

    const logo = (
        <span
            className={className}
            role="img"
            aria-label="Converge"
            style={{
                display: "inline-flex",
                alignItems: "baseline", // mark sits on the text baseline
                gap: "0.26em",
                fontFamily:
                '"Google Sans Flex", "Google Sans", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                fontSize: size,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                whiteSpace: "nowrap",
                ...style,
            }}
        >
            {showMark && <Mark accent={accent} />}
            {showText && <span aria-hidden="true">Converge</span>}
        </span>
    );

    if (href) {
        return (
            <a
                href={href}
                aria-label="Converge home"
                style={{ color: "inherit", textDecoration: "none", display: "inline-flex" }}
            >
                {logo}
            </a>
        );
    }

    return logo;
}

/*
 * Recommended: add this to your index.html <head> so the font is ready
 * before the first paint (the component also loads it on its own).
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com" />
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 * <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..900&display=swap" rel="stylesheet" />
 */