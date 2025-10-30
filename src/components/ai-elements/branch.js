"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
const BranchContext = createContext(null);
const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error("Branch components must be used within Branch");
    }
    return context;
};
export const Branch = ({ defaultBranch = 0, onBranchChange, className, ...props }) => {
    const [currentBranch, setCurrentBranch] = useState(defaultBranch);
    const [branches, setBranches] = useState([]);
    const handleBranchChange = (newBranch) => {
        setCurrentBranch(newBranch);
        onBranchChange?.(newBranch);
    };
    const goToPrevious = () => {
        const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
        handleBranchChange(newBranch);
    };
    const goToNext = () => {
        const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
        handleBranchChange(newBranch);
    };
    const contextValue = {
        currentBranch,
        totalBranches: branches.length,
        goToPrevious,
        goToNext,
        branches,
        setBranches,
    };
    return (_jsx(BranchContext.Provider, { value: contextValue, children: _jsx("div", { className: cn("grid w-full gap-2 [&>div]:pb-0", className), ...props }) }));
};
export const BranchMessages = ({ children, ...props }) => {
    const { currentBranch, setBranches, branches } = useBranch();
    const childrenArray = Array.isArray(children) ? children : [children];
    // Use useEffect to update branches when they change
    useEffect(() => {
        if (branches.length !== childrenArray.length) {
            setBranches(childrenArray);
        }
    }, [childrenArray, branches, setBranches]);
    return childrenArray.map((branch, index) => (_jsx("div", { className: cn("grid gap-2 overflow-hidden [&>div]:pb-0", index === currentBranch ? "block" : "hidden"), ...props, children: branch }, branch.key)));
};
export const BranchSelector = ({ className, from, ...props }) => {
    const { totalBranches } = useBranch();
    // Don't render if there's only one branch
    if (totalBranches <= 1) {
        return null;
    }
    return (_jsx("div", { className: cn("flex items-center gap-2 self-end px-10", from === "assistant" ? "justify-start" : "justify-end", className), ...props }));
};
export const BranchPrevious = ({ className, children, ...props }) => {
    const { goToPrevious, totalBranches } = useBranch();
    return (_jsx(Button, { "aria-label": "Previous branch", className: cn("size-7 shrink-0 rounded-full text-muted-foreground transition-colors", "hover:bg-accent hover:text-foreground", "disabled:pointer-events-none disabled:opacity-50", className), disabled: totalBranches <= 1, onClick: goToPrevious, size: "icon", type: "button", variant: "ghost", ...props, children: children ?? _jsx(ChevronLeftIcon, { size: 14 }) }));
};
export const BranchNext = ({ className, children, ...props }) => {
    const { goToNext, totalBranches } = useBranch();
    return (_jsx(Button, { "aria-label": "Next branch", className: cn("size-7 shrink-0 rounded-full text-muted-foreground transition-colors", "hover:bg-accent hover:text-foreground", "disabled:pointer-events-none disabled:opacity-50", className), disabled: totalBranches <= 1, onClick: goToNext, size: "icon", type: "button", variant: "ghost", ...props, children: children ?? _jsx(ChevronRightIcon, { size: 14 }) }));
};
export const BranchPage = ({ className, ...props }) => {
    const { currentBranch, totalBranches } = useBranch();
    return (_jsxs("span", { className: cn("font-medium text-muted-foreground text-xs tabular-nums", className), ...props, children: [currentBranch + 1, " of ", totalBranches] }));
};
