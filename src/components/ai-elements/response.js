"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { Streamdown } from "streamdown";
export const Response = memo(({ className, ...props }) => (_jsx(Streamdown, { className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className), ...props })), (prevProps, nextProps) => prevProps.children === nextProps.children);
Response.displayName = "Response";
