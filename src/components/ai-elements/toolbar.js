import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { NodeToolbar, Position } from "@xyflow/react";
export const Toolbar = ({ className, ...props }) => (_jsx(NodeToolbar, { className: cn("flex items-center gap-1 rounded-sm border bg-background p-1.5", className), position: Position.Bottom, ...props }));
