"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export const Actions = ({ className, children, ...props }) => (_jsx("div", { className: cn("flex items-center gap-1", className), ...props, children: children }));
export const Action = ({ tooltip, children, label, className, variant = "ghost", size = "sm", ...props }) => {
    const button = (_jsxs(Button, { className: cn("relative size-9 p-1.5 text-muted-foreground hover:text-foreground", className), size: size, type: "button", variant: variant, ...props, children: [children, _jsx("span", { className: "sr-only", children: label || tooltip })] }));
    if (tooltip) {
        return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: button }), _jsx(TooltipContent, { children: _jsx("p", { children: tooltip }) })] }) }));
    }
    return button;
};
