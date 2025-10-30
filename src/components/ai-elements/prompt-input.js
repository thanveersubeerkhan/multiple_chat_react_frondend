"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea, } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2Icon, MicIcon, PaperclipIcon, PlusIcon, SendIcon, SquareIcon, XIcon, } from "lucide-react";
import { nanoid } from "nanoid";
import { Children, createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
const PromptInputController = createContext(null);
const ProviderAttachmentsContext = createContext(null);
export const usePromptInputController = () => {
    const ctx = useContext(PromptInputController);
    if (!ctx) {
        throw new Error("Wrap your component inside <PromptInputProvider> to use usePromptInputController().");
    }
    return ctx;
};
// Optional variants (do NOT throw). Useful for dual-mode components.
const useOptionalPromptInputController = () => useContext(PromptInputController);
export const useProviderAttachments = () => {
    const ctx = useContext(ProviderAttachmentsContext);
    if (!ctx) {
        throw new Error("Wrap your component inside <PromptInputProvider> to use useProviderAttachments().");
    }
    return ctx;
};
const useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);
/**
 * Optional global provider that lifts PromptInput state outside of PromptInput.
 * If you don't use it, PromptInput stays fully self-managed.
 */
export function PromptInputProvider({ initialInput: initialTextInput = "", children, }) {
    // ----- textInput state
    const [textInput, setTextInput] = useState(initialTextInput);
    const clearInput = useCallback(() => setTextInput(""), []);
    // ----- attachments state (global when wrapped)
    const [attachements, setAttachements] = useState([]);
    const fileInputRef = useRef(null);
    const openRef = useRef(() => { });
    const add = useCallback((files) => {
        const incoming = Array.from(files);
        if (incoming.length === 0)
            return;
        setAttachements((prev) => prev.concat(incoming.map((file) => ({
            id: nanoid(),
            type: "file",
            url: URL.createObjectURL(file),
            mediaType: file.type,
            filename: file.name,
        }))));
    }, []);
    const remove = useCallback((id) => {
        setAttachements((prev) => {
            const found = prev.find((f) => f.id === id);
            if (found?.url)
                URL.revokeObjectURL(found.url);
            return prev.filter((f) => f.id !== id);
        });
    }, []);
    const clear = useCallback(() => {
        setAttachements((prev) => {
            for (const f of prev)
                if (f.url)
                    URL.revokeObjectURL(f.url);
            return [];
        });
    }, []);
    const openFileDialog = useCallback(() => {
        openRef.current?.();
    }, []);
    const attachments = useMemo(() => ({
        files: attachements,
        add,
        remove,
        clear,
        openFileDialog,
        fileInputRef,
    }), [attachements, add, remove, clear, openFileDialog]);
    const __registerFileInput = useCallback((ref, open) => {
        fileInputRef.current = ref.current;
        openRef.current = open;
    }, []);
    const controller = useMemo(() => ({
        textInput: {
            value: textInput,
            setInput: setTextInput,
            clear: clearInput,
        },
        attachments,
        __registerFileInput,
    }), [textInput, clearInput, attachments, __registerFileInput]);
    return (_jsx(PromptInputController.Provider, { value: controller, children: _jsx(ProviderAttachmentsContext.Provider, { value: attachments, children: children }) }));
}
// ============================================================================
// Component Context & Hooks
// ============================================================================
const LocalAttachmentsContext = createContext(null);
export const usePromptInputAttachments = () => {
    // Dual-mode: prefer provider if present, otherwise use local
    const provider = useOptionalProviderAttachments();
    const local = useContext(LocalAttachmentsContext);
    const context = provider ?? local;
    if (!context) {
        throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
    }
    return context;
};
export function PromptInputAttachment({ data, className, ...props }) {
    const attachments = usePromptInputAttachments();
    const filename = data.filename || "";
    const mediaType = data.mediaType?.startsWith("image/") && data.url ? "image" : "file";
    const isImage = mediaType === "image";
    const attachmentLabel = filename || (isImage ? "Image" : "Attachment");
    return (_jsxs(PromptInputHoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsxs("div", { className: cn("group relative flex h-8 cursor-default select-none items-center gap-1.5 rounded-md border border-border px-1.5 font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50", className), ...props, children: [_jsxs("div", { className: "relative size-5 shrink-0", children: [_jsx("div", { className: "absolute inset-0 flex size-5 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0", children: isImage ? (_jsx("img", { alt: filename || "attachment", className: "size-5 object-cover", height: 20, src: data.url, width: 20 })) : (_jsx("div", { className: "flex size-5 items-center justify-center text-muted-foreground", children: _jsx(PaperclipIcon, { className: "size-3" }) })) }), _jsxs(Button, { "aria-label": "Remove attachment", className: "absolute inset-0 size-5 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2.5", onClick: (e) => {
                                        e.stopPropagation();
                                        attachments.remove(data.id);
                                    }, type: "button", variant: "ghost", children: [_jsx(XIcon, {}), _jsx("span", { className: "sr-only", children: "Remove" })] })] }), _jsx("span", { className: "flex-1 truncate", children: attachmentLabel })] }, data.id) }), _jsx(PromptInputHoverCardContent, { className: "w-auto p-2", children: _jsxs("div", { className: "w-auto space-y-3", children: [isImage && (_jsx("div", { className: "flex max-h-96 w-96 items-center justify-center overflow-hidden rounded-md border", children: _jsx("img", { alt: filename || "attachment preview", className: "max-h-full max-w-full object-contain", height: 384, src: data.url, width: 448 }) })), _jsx("div", { className: "flex items-center gap-2.5", children: _jsxs("div", { className: "min-w-0 flex-1 space-y-1 px-0.5", children: [_jsx("h4", { className: "truncate font-semibold text-sm leading-none", children: filename || (isImage ? "Image" : "Attachment") }), data.mediaType && (_jsx("p", { className: "truncate font-mono text-muted-foreground text-xs", children: data.mediaType }))] }) })] }) })] }));
}
export function PromptInputAttachments({ children, }) {
    const attachments = usePromptInputAttachments();
    if (!attachments.files.length) {
        return null;
    }
    return attachments.files.map((file) => (_jsx(Fragment, { children: children(file) }, file.id)));
}
export const PromptInputActionAddAttachments = ({ label = "Add photos or files", ...props }) => {
    const attachments = usePromptInputAttachments();
    return (_jsxs(DropdownMenuItem, { ...props, onSelect: (e) => {
            e.preventDefault();
            attachments.openFileDialog();
        }, children: [_jsx(ImageIcon, { className: "mr-2 size-4" }), " ", label] }));
};
export const PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
    // Try to use a provider controller if present
    const controller = useOptionalPromptInputController();
    const usingProvider = !!controller;
    // Refs
    const inputRef = useRef(null);
    const anchorRef = useRef(null);
    const formRef = useRef(null);
    // Find nearest form to scope drag & drop
    useEffect(() => {
        const root = anchorRef.current?.closest("form");
        if (root instanceof HTMLFormElement) {
            formRef.current = root;
        }
    }, []);
    // ----- Local attachments (only used when no provider)
    const [items, setItems] = useState([]);
    const files = usingProvider ? controller.attachments.files : items;
    const openFileDialogLocal = useCallback(() => {
        inputRef.current?.click();
    }, []);
    const matchesAccept = useCallback((f) => {
        if (!accept || accept.trim() === "") {
            return true;
        }
        if (accept.includes("image/*")) {
            return f.type.startsWith("image/");
        }
        // NOTE: keep simple; expand as needed
        return true;
    }, [accept]);
    const addLocal = useCallback((fileList) => {
        const incoming = Array.from(fileList);
        const accepted = incoming.filter((f) => matchesAccept(f));
        if (incoming.length && accepted.length === 0) {
            onError?.({
                code: "accept",
                message: "No files match the accepted types.",
            });
            return;
        }
        const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
        const sized = accepted.filter(withinSize);
        if (accepted.length > 0 && sized.length === 0) {
            onError?.({
                code: "max_file_size",
                message: "All files exceed the maximum size.",
            });
            return;
        }
        setItems((prev) => {
            const capacity = typeof maxFiles === "number"
                ? Math.max(0, maxFiles - prev.length)
                : undefined;
            const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
            if (typeof capacity === "number" && sized.length > capacity) {
                onError?.({
                    code: "max_files",
                    message: "Too many files. Some were not added.",
                });
            }
            const next = [];
            for (const file of capped) {
                next.push({
                    id: nanoid(),
                    type: "file",
                    url: URL.createObjectURL(file),
                    mediaType: file.type,
                    filename: file.name,
                });
            }
            return prev.concat(next);
        });
    }, [matchesAccept, maxFiles, maxFileSize, onError]);
    const add = usingProvider
        ? (files) => controller.attachments.add(files)
        : addLocal;
    const remove = usingProvider
        ? (id) => controller.attachments.remove(id)
        : (id) => setItems((prev) => {
            const found = prev.find((file) => file.id === id);
            if (found?.url) {
                URL.revokeObjectURL(found.url);
            }
            return prev.filter((file) => file.id !== id);
        });
    const clear = usingProvider
        ? () => controller.attachments.clear()
        : () => setItems((prev) => {
            for (const file of prev) {
                if (file.url) {
                    URL.revokeObjectURL(file.url);
                }
            }
            return [];
        });
    const openFileDialog = usingProvider
        ? () => controller.attachments.openFileDialog()
        : openFileDialogLocal;
    // Let provider know about our hidden file input so external menus can call openFileDialog()
    useEffect(() => {
        if (!usingProvider)
            return;
        controller.__registerFileInput(inputRef, () => inputRef.current?.click());
    }, [usingProvider, controller]);
    // Note: File input cannot be programmatically set for security reasons
    // The syncHiddenInput prop is no longer functional
    useEffect(() => {
        if (syncHiddenInput && inputRef.current && files.length === 0) {
            inputRef.current.value = "";
        }
    }, [files, syncHiddenInput]);
    // Attach drop handlers on nearest form and document (opt-in)
    useEffect(() => {
        const form = formRef.current;
        if (!form)
            return;
        const onDragOver = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
        };
        const onDrop = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                add(e.dataTransfer.files);
            }
        };
        form.addEventListener("dragover", onDragOver);
        form.addEventListener("drop", onDrop);
        return () => {
            form.removeEventListener("dragover", onDragOver);
            form.removeEventListener("drop", onDrop);
        };
    }, [add]);
    useEffect(() => {
        if (!globalDrop)
            return;
        const onDragOver = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
        };
        const onDrop = (e) => {
            if (e.dataTransfer?.types?.includes("Files")) {
                e.preventDefault();
            }
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                add(e.dataTransfer.files);
            }
        };
        document.addEventListener("dragover", onDragOver);
        document.addEventListener("drop", onDrop);
        return () => {
            document.removeEventListener("dragover", onDragOver);
            document.removeEventListener("drop", onDrop);
        };
    }, [add, globalDrop]);
    useEffect(() => () => {
        if (!usingProvider) {
            for (const f of files) {
                if (f.url)
                    URL.revokeObjectURL(f.url);
            }
        }
    }, [usingProvider, files]);
    const handleChange = (event) => {
        if (event.currentTarget.files) {
            add(event.currentTarget.files);
        }
    };
    const convertBlobUrlToDataUrl = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    const ctx = useMemo(() => ({
        files: files.map((item) => ({ ...item, id: item.id })),
        add,
        remove,
        clear,
        openFileDialog,
        fileInputRef: inputRef,
    }), [files, add, remove, clear, openFileDialog]);
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const text = usingProvider
            ? controller.textInput.value
            : (() => {
                const formData = new FormData(form);
                return formData.get("message") || "";
            })();
        // Reset form immediately after capturing text to avoid race condition
        // where user input during async blob conversion would be lost
        if (!usingProvider) {
            form.reset();
        }
        // Convert blob URLs to data URLs asynchronously
        Promise.all(files.map(async ({ id, ...item }) => {
            if (item.url && item.url.startsWith("blob:")) {
                return {
                    ...item,
                    url: await convertBlobUrlToDataUrl(item.url),
                };
            }
            return item;
        })).then((convertedFiles) => {
            try {
                const result = onSubmit({ text, files: convertedFiles }, event);
                // Handle both sync and async onSubmit
                if (result instanceof Promise) {
                    result
                        .then(() => {
                        clear();
                        if (usingProvider) {
                            controller.textInput.clear();
                        }
                    })
                        .catch(() => {
                        // Don't clear on error - user may want to retry
                    });
                }
                else {
                    // Sync function completed without throwing, clear attachments
                    clear();
                    if (usingProvider) {
                        controller.textInput.clear();
                    }
                }
            }
            catch (error) {
                // Don't clear on error - user may want to retry
            }
        });
    };
    // Render with or without local provider
    const inner = (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: "hidden", ref: anchorRef }), _jsx("input", { accept: accept, "aria-label": "Upload files", className: "hidden", multiple: multiple, onChange: handleChange, ref: inputRef, title: "Upload files", type: "file" }), _jsx("form", { className: cn("w-full", className), onSubmit: handleSubmit, ...props, children: _jsx(InputGroup, { children: children }) })] }));
    return usingProvider ? (inner) : (_jsx(LocalAttachmentsContext.Provider, { value: ctx, children: inner }));
};
export const PromptInputBody = ({ className, ...props }) => (_jsx("div", { className: cn("contents", className), ...props }));
export const PromptInputTextarea = ({ onChange, className, placeholder = "What would you like to know?", ...props }) => {
    const controller = useOptionalPromptInputController();
    const attachments = usePromptInputAttachments();
    const [isComposing, setIsComposing] = useState(false);
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (isComposing || e.nativeEvent.isComposing) {
                return;
            }
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
        // Remove last attachment when Backspace is pressed and textarea is empty
        if (e.key === "Backspace" &&
            e.currentTarget.value === "" &&
            attachments.files.length > 0) {
            e.preventDefault();
            const lastAttachment = attachments.files.at(-1);
            if (lastAttachment) {
                attachments.remove(lastAttachment.id);
            }
        }
    };
    const handlePaste = (event) => {
        const items = event.clipboardData?.items;
        if (!items) {
            return;
        }
        const files = [];
        for (const item of items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }
        if (files.length > 0) {
            event.preventDefault();
            attachments.add(files);
        }
    };
    const controlledProps = controller
        ? {
            value: controller.textInput.value,
            onChange: (e) => {
                controller.textInput.setInput(e.currentTarget.value);
                onChange?.(e);
            },
        }
        : {
            onChange,
        };
    return (_jsx(InputGroupTextarea, { className: cn("field-sizing-content max-h-48 min-h-16", className), name: "message", onCompositionEnd: () => setIsComposing(false), onCompositionStart: () => setIsComposing(true), onKeyDown: handleKeyDown, onPaste: handlePaste, placeholder: placeholder, ...props, ...controlledProps }));
};
export const PromptInputHeader = ({ className, ...props }) => (_jsx(InputGroupAddon, { align: "block-end", className: cn("order-first flex-wrap gap-1", className), ...props }));
export const PromptInputFooter = ({ className, ...props }) => (_jsx(InputGroupAddon, { align: "block-end", className: cn("justify-between gap-1", className), ...props }));
export const PromptInputTools = ({ className, ...props }) => (_jsx("div", { className: cn("flex items-center gap-1", className), ...props }));
export const PromptInputButton = ({ variant = "ghost", className, size, ...props }) => {
    const newSize = size ?? (Children.count(props.children) > 1 ? "sm" : "icon-sm");
    return (_jsx(InputGroupButton, { className: cn(className), size: newSize, type: "button", variant: variant, ...props }));
};
export const PromptInputActionMenu = (props) => (_jsx(DropdownMenu, { ...props }));
export const PromptInputActionMenuTrigger = ({ className, children, ...props }) => (_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(PromptInputButton, { className: className, ...props, children: children ?? _jsx(PlusIcon, { className: "size-4" }) }) }));
export const PromptInputActionMenuContent = ({ className, ...props }) => (_jsx(DropdownMenuContent, { align: "start", className: cn(className), ...props }));
export const PromptInputActionMenuItem = ({ className, ...props }) => (_jsx(DropdownMenuItem, { className: cn(className), ...props }));
export const PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, children, ...props }) => {
    let Icon = _jsx(SendIcon, { className: "size-4" });
    if (status === "submitted") {
        Icon = _jsx(Loader2Icon, { className: "size-4 animate-spin" });
    }
    else if (status === "streaming") {
        Icon = _jsx(SquareIcon, { className: "size-4" });
    }
    else if (status === "error") {
        Icon = _jsx(XIcon, { className: "size-4" });
    }
    return (_jsx(InputGroupButton, { "aria-label": "Submit", className: cn(className), size: size, type: "submit", variant: variant, ...props, children: children ?? Icon }));
};
export const PromptInputSpeechButton = ({ className, textareaRef, onTranscriptionChange, ...props }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const recognitionRef = useRef(null);
    useEffect(() => {
        if (typeof window !== "undefined" &&
            ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const speechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.lang = "en-US";
            speechRecognition.onstart = () => {
                setIsListening(true);
            };
            speechRecognition.onend = () => {
                setIsListening(false);
            };
            speechRecognition.onresult = (event) => {
                let finalTranscript = "";
                const results = Array.from(event.results);
                for (const result of results) {
                    if (result.isFinal) {
                        finalTranscript += result[0]?.transcript ?? "";
                    }
                }
                if (finalTranscript && textareaRef?.current) {
                    const textarea = textareaRef.current;
                    const currentValue = textarea.value;
                    const newValue = currentValue + (currentValue ? " " : "") + finalTranscript;
                    textarea.value = newValue;
                    textarea.dispatchEvent(new Event("input", { bubbles: true }));
                    onTranscriptionChange?.(newValue);
                }
            };
            speechRecognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
            recognitionRef.current = speechRecognition;
            setRecognition(speechRecognition);
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [textareaRef, onTranscriptionChange]);
    const toggleListening = useCallback(() => {
        if (!recognition) {
            return;
        }
        if (isListening) {
            recognition.stop();
        }
        else {
            recognition.start();
        }
    }, [recognition, isListening]);
    return (_jsx(PromptInputButton, { className: cn("relative transition-all duration-200", isListening && "animate-pulse bg-accent text-accent-foreground", className), disabled: !recognition, onClick: toggleListening, ...props, children: _jsx(MicIcon, { className: "size-4" }) }));
};
export const PromptInputModelSelect = (props) => (_jsx(Select, { ...props }));
export const PromptInputModelSelectTrigger = ({ className, ...props }) => (_jsx(SelectTrigger, { className: cn("border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors", 'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground', className), ...props }));
export const PromptInputModelSelectContent = ({ className, ...props }) => (_jsx(SelectContent, { className: cn(className), ...props }));
export const PromptInputModelSelectItem = ({ className, ...props }) => (_jsx(SelectItem, { className: cn(className), ...props }));
export const PromptInputModelSelectValue = ({ className, ...props }) => (_jsx(SelectValue, { className: cn(className), ...props }));
export const PromptInputHoverCard = ({ openDelay = 0, closeDelay = 0, ...props }) => (_jsx(HoverCard, { closeDelay: closeDelay, openDelay: openDelay, ...props }));
export const PromptInputHoverCardTrigger = (props) => _jsx(HoverCardTrigger, { ...props });
export const PromptInputHoverCardContent = ({ align = "start", ...props }) => (_jsx(HoverCardContent, { align: align, ...props }));
export const PromptInputTabsList = ({ className, ...props }) => _jsx("div", { className: cn(className), ...props });
export const PromptInputTab = ({ className, ...props }) => _jsx("div", { className: cn(className), ...props });
export const PromptInputTabLabel = ({ className, ...props }) => (_jsx("h3", { className: cn("mb-2 px-3 font-medium text-muted-foreground text-xs", className), ...props }));
export const PromptInputTabBody = ({ className, ...props }) => (_jsx("div", { className: cn("space-y-1", className), ...props }));
export const PromptInputTabItem = ({ className, ...props }) => (_jsx("div", { className: cn("flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent", className), ...props }));
export const PromptInputCommand = ({ className, ...props }) => _jsx(Command, { className: cn(className), ...props });
export const PromptInputCommandInput = ({ className, ...props }) => (_jsx(CommandInput, { className: cn(className), ...props }));
export const PromptInputCommandList = ({ className, ...props }) => (_jsx(CommandList, { className: cn(className), ...props }));
export const PromptInputCommandEmpty = ({ className, ...props }) => (_jsx(CommandEmpty, { className: cn(className), ...props }));
export const PromptInputCommandGroup = ({ className, ...props }) => (_jsx(CommandGroup, { className: cn(className), ...props }));
export const PromptInputCommandItem = ({ className, ...props }) => (_jsx(CommandItem, { className: cn(className), ...props }));
export const PromptInputCommandSeparator = ({ className, ...props }) => (_jsx(CommandSeparator, { className: cn(className), ...props }));
