import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
import { Send, Menu, X, Plus, Trash2, Sparkles } from "lucide-react";
const AI_ELEMENTS = [
    {
        icon: "✨",
        title: "Enhance Writing",
        prompt: "Improve and enhance the following text: "
    },
    {
        icon: "🧠",
        title: "Explain",
        prompt: "Explain this concept in simple terms: "
    },
    {
        icon: "📝",
        title: "Summarize",
        prompt: "Summarize this text: "
    },
    {
        icon: "🔍",
        title: "Analyze",
        prompt: "Analyze and provide insights on: "
    },
    {
        icon: "💡",
        title: "Brainstorm",
        prompt: "Generate creative ideas for: "
    },
    {
        icon: "✅",
        title: "Fix Issues",
        prompt: "Fix and improve the following: "
    }
];
export default function App() {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [showAIElements, setShowAIElements] = useState(false);
    const messagesEndRef = useRef(null);
    const conversationRef = useRef(null);
    const inputRef = useRef(null);
    // Auto-focus input when chat is selected
    useEffect(() => {
        if (currentChat && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentChat]);
    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages, isStreaming]);
    const fetchChats = useCallback(async () => {
        try {
            setIsLoadingChats(true);
            setError(null);
            const response = await fetch("http://localhost:3000/chats");
            if (!response.ok) {
                throw new Error(`Failed to fetch chats: ${response.status}`);
            }
            const chatsData = await response.json();
            setChats(chatsData);
        }
        catch (error) {
            console.error("Error fetching chats:", error);
            setError("Failed to load chats");
        }
        finally {
            setIsLoadingChats(false);
        }
    }, []);
    const fetchChat = useCallback(async (chatId) => {
        try {
            setIsLoadingMessages(true);
            setError(null);
            const response = await fetch(`http://localhost:3000/chats/${chatId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch chat: ${response.status}`);
            }
            const chatData = await response.json();
            setCurrentChat({
                id: chatData.id,
                title: chatData.title,
                created_at: chatData.created_at,
                updated_at: chatData.updated_at,
            });
            if (chatData.messages && chatData.messages.length > 0) {
                const convertedMessages = chatData.messages.map((msg) => ({
                    id: msg.id.toString(),
                    role: msg.role,
                    content: msg.content,
                }));
                setMessages(convertedMessages);
            }
            else {
                setMessages([]);
            }
        }
        catch (error) {
            console.error("Error fetching chat:", error);
            setError("Failed to load chat");
        }
        finally {
            setIsLoadingMessages(false);
        }
    }, []);
    const createNewChat = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch("http://localhost:3000/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Chat" }),
            });
            if (!response.ok) {
                throw new Error(`Failed to create chat: ${response.status}`);
            }
            const newChat = await response.json();
            setCurrentChat(newChat);
            setMessages([]);
            setInput("");
            setShowAIElements(false);
            await fetchChats();
        }
        catch (error) {
            console.error("Error creating chat:", error);
            setError("Failed to create chat");
        }
    }, [fetchChats]);
    const deleteChat = useCallback(async (chatId, e) => {
        e.stopPropagation();
        try {
            setError(null);
            const response = await fetch(`http://localhost:3000/chats/${chatId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Failed to delete chat: ${response.status}`);
            }
            if (currentChat && currentChat.id === chatId) {
                setCurrentChat(null);
                setMessages([]);
                setInput("");
            }
            fetchChats();
        }
        catch (error) {
            console.error("Error deleting chat:", error);
            setError("Failed to delete chat");
        }
    }, [currentChat, fetchChats]);
    const updateChatTitle = useCallback(async (chatId, newTitle) => {
        try {
            setError(null);
            const response = await fetch(`http://localhost:3000/chats/${chatId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update chat title: ${response.status}`);
            }
            fetchChats();
        }
        catch (error) {
            console.error("Error updating chat title:", error);
            setError("Failed to update chat title");
        }
    }, [fetchChats]);
    const sendMessage = useCallback(async (message) => {
        if (!message.trim())
            return;
        try {
            setIsStreaming(true);
            setError(null);
            setShowAIElements(false);
            const userMessage = {
                id: Date.now().toString(),
                role: "user",
                content: message,
            };
            setMessages((prev) => [...prev, userMessage]);
            const apiUrl = currentChat
                ? `http://localhost:3000/chat/${currentChat.id}`
                : "http://localhost:3000/chat";
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            parts: [{ type: "text", text: message }],
                        },
                    ],
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No response body");
            }
            let assistantMessage = "";
            const assistantMessageId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                },
            ]);
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") {
                            break;
                        }
                        if (data) {
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === "text-delta" && parsed.textDelta) {
                                    assistantMessage += parsed.textDelta;
                                    setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId
                                        ? { ...msg, content: assistantMessage }
                                        : msg));
                                }
                            }
                            catch (e) {
                                // Ignore JSON parse errors for non-data chunks
                            }
                        }
                    }
                }
            }
            await fetchChats();
        }
        catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message");
            setMessages((prev) => prev.filter((msg) => msg.content !== ""));
        }
        finally {
            setIsStreaming(false);
        }
    }, [currentChat, fetchChats]);
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming)
            return;
        sendMessage(input);
        setInput("");
    }, [input, isStreaming, sendMessage]);
    const handleInputChange = useCallback((e) => {
        setInput(e.target.value);
    }, []);
    const handleTextareaKeyDown = useCallback((e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
        const textarea = e.currentTarget;
        setTimeout(() => {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
        }, 0);
    }, [handleSubmit]);
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return "Today";
        if (diffDays === 1)
            return "Yesterday";
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };
    return (_jsxs("div", { className: "flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden", children: [_jsxs("div", { className: `${isSidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-80`, children: [_jsx("div", { className: "p-4 border-b border-slate-700/30 flex-shrink-0", children: _jsxs("button", { onClick: createNewChat, className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-blue-500/50", children: [_jsx(Plus, { size: 18 }), _jsx("span", { children: "New Chat" })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: isLoadingChats ? (_jsxs("div", { className: "p-6 text-center text-slate-400 flex flex-col items-center gap-2", children: [_jsx("div", { className: "animate-spin text-2xl", children: "\u2699\uFE0F" }), _jsx("span", { className: "text-sm", children: "Loading chats..." })] })) : chats.length === 0 ? (_jsxs("div", { className: "p-6 text-center text-slate-400 flex flex-col items-center gap-3", children: [_jsx("div", { className: "text-3xl", children: "\uD83D\uDCAC" }), _jsx("span", { className: "text-sm", children: "No chats yet" }), _jsx("span", { className: "text-xs text-slate-500", children: "Create one to get started" })] })) : (_jsx("div", { className: "p-3 space-y-2", children: chats.map((chat) => (_jsx("div", { className: `group p-4 rounded-xl cursor-pointer transition-all duration-200 ${currentChat?.id === chat.id
                                    ? "bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                                    : "hover:bg-slate-700/30 border border-transparent hover:border-slate-600/50"}`, onClick: () => fetchChat(chat.id), children: _jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-medium text-white truncate text-sm leading-tight", children: chat.title }), _jsxs("div", { className: "text-xs text-slate-400 mt-2 flex items-center gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-slate-500 rounded-full inline-block" }), formatDate(chat.updated_at)] })] }), _jsx("button", { onClick: (e) => deleteChat(chat.id, e), className: "ml-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-md", children: _jsx(Trash2, { size: 16 }) })] }) }, chat.id))) })) }), _jsxs("div", { className: "p-4 border-t border-slate-700/30 bg-slate-900/50 space-y-3 flex-shrink-0", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { className: "bg-slate-700/30 rounded-lg p-2 text-slate-300", children: [_jsx("div", { className: "font-semibold text-blue-400", children: chats.length }), _jsx("div", { className: "text-slate-400", children: "Chats" })] }), _jsxs("div", { className: "bg-slate-700/30 rounded-lg p-2 text-slate-300", children: [_jsx("div", { className: "font-semibold text-blue-400", children: messages.length }), _jsx("div", { className: "text-slate-400", children: "Messages" })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-green-500" }), _jsx("span", { children: isStreaming ? "Thinking..." : "Ready" })] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-4 flex items-center justify-between flex-shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white flex-shrink-0", children: isSidebarOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) }), _jsx("div", { className: "h-8 w-px bg-slate-700/30" }), currentChat ? (_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" }), _jsx("input", { type: "text", value: currentChat.title, onChange: (e) => setCurrentChat({ ...currentChat, title: e.target.value }), onBlur: (e) => {
                                                    if (e.target.value.trim()) {
                                                        updateChatTitle(currentChat.id, e.target.value.trim());
                                                    }
                                                    else {
                                                        setCurrentChat({
                                                            ...currentChat,
                                                            title: "New Chat",
                                                        });
                                                        updateChatTitle(currentChat.id, "New Chat");
                                                    }
                                                }, className: "text-lg font-semibold bg-transparent border-none outline-none text-white placeholder-slate-500 truncate", placeholder: "Chat title..." })] })) : (_jsx("div", { className: "text-lg font-semibold text-slate-400 truncate", children: messages.length > 0
                                            ? "New Chat"
                                            : "Start a conversation" }))] }), error && (_jsxs("div", { className: "px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg flex items-center gap-2 flex-shrink-0 ml-4", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-500" }), error] }))] }), _jsx("div", { className: "flex-1 flex flex-col min-h-0 overflow-hidden", children: isLoadingMessages ? (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-4 text-3xl animate-spin", children: "\u2699\uFE0F" }), _jsx("div", { className: "text-slate-400", children: "Loading messages..." })] }) })) : messages.length === 0 && !currentChat ? (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u2728" }), _jsx("div", { className: "text-2xl font-bold text-white mb-3", children: "Welcome to Chat" }), _jsx("div", { className: "text-slate-400 mb-6 max-w-xs", children: "Start a conversation by typing a message below or create a new chat" }), _jsxs("button", { onClick: createNewChat, className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/50 inline-flex items-center gap-2", children: [_jsx(Plus, { size: 18 }), "New Chat"] })] }) })) : (_jsxs("div", { ref: conversationRef, className: "flex-1 overflow-y-auto p-6 space-y-6", children: [messages.length === 0 && currentChat && (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center text-slate-400", children: [_jsx("div", { className: "text-2xl mb-4", children: "\uD83D\uDCAC" }), _jsx("div", { className: "text-lg font-medium", children: "Start a new conversation" })] }) })), messages.map((msg) => (_jsxs("div", { className: `flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`, children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${msg.role === "user"
                                                ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                                                : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"}`, children: msg.role === "user" ? "U" : "AI" }), _jsx("div", { className: `flex-1 max-w-2xl ${msg.role === "user" ? "text-right" : "text-left"}`, children: _jsx("div", { className: `inline-block px-5 py-3 rounded-2xl backdrop-blur-sm ${msg.role === "user"
                                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-br-none"
                                                    : "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg shadow-slate-900/20 rounded-bl-none border border-slate-600/50"}`, children: _jsx("div", { className: "whitespace-pre-wrap text-sm leading-relaxed break-words", children: msg.content }) }) })] }, msg.id))), isStreaming && (_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg shadow-emerald-500/30", children: "AI" }), _jsx("div", { className: "flex-1 max-w-2xl", children: _jsx("div", { className: "inline-block px-5 py-3 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg shadow-slate-900/20 rounded-bl-none border border-slate-600/50", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.1s" } }), _jsx("div", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0.2s" } })] }), _jsx("span", { className: "text-sm text-slate-300", children: "Thinking..." })] }) }) })] })), _jsx("div", { ref: messagesEndRef })] })) }), !isStreaming && messages.length > 0 && (_jsxs("div", { className: "px-6 pb-3 flex-shrink-0", children: [_jsxs("button", { onClick: () => setShowAIElements(!showAIElements), className: "flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors", children: [_jsx(Sparkles, { size: 16 }), showAIElements ? "Hide" : "Show", " AI Elements"] }), showAIElements && (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 mt-2", children: AI_ELEMENTS.map((element, idx) => (_jsxs("button", { onClick: () => {
                                        setShowAIElements(false);
                                        sendMessage(element.prompt);
                                    }, disabled: isStreaming, className: "p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/30 hover:border-blue-500/50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group", children: [_jsx("div", { className: "text-xl mb-1", children: element.icon }), _jsx("div", { className: "text-xs font-medium text-white group-hover:text-blue-300 transition-colors", children: element.title })] }, idx))) }))] })), currentChat && (_jsxs("div", { className: "border-t border-slate-700/30 bg-gradient-to-t from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-6 flex-shrink-0", children: [_jsxs("div", { className: "flex gap-3 max-w-5xl", children: [_jsx("textarea", { ref: inputRef, value: input, onChange: handleInputChange, onKeyDown: handleTextareaKeyDown, placeholder: "Ask me anything... (Shift+Enter for new line)", disabled: isStreaming || isLoadingMessages, className: "flex-1 border border-slate-600/50 rounded-xl px-5 py-3 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-blue-500/20 resize-none disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 transition-all duration-200", rows: 1, style: { minHeight: "48px", maxHeight: "100px" } }), _jsx("button", { onClick: handleSubmit, disabled: !input.trim() || isStreaming || isLoadingMessages, className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-fit font-medium shadow-lg hover:shadow-blue-500/50 disabled:shadow-none flex-shrink-0", children: isStreaming ? (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-white rounded-full animate-bounce" }), _jsx("div", { className: "w-1.5 h-1.5 bg-white rounded-full animate-bounce", style: { animationDelay: "0.1s" } }), _jsx("div", { className: "w-1.5 h-1.5 bg-white rounded-full animate-bounce", style: { animationDelay: "0.2s" } })] }) })) : (_jsx(Send, { size: 20 })) })] }), _jsxs("div", { className: "mt-3 flex justify-between items-center text-xs text-slate-400 px-1", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-slate-600" }), "Chat: ", currentChat ? `#${currentChat.id}` : "New"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-slate-600" }), isLoadingMessages
                                                ? "Loading..."
                                                : isStreaming
                                                    ? "Streaming..."
                                                    : "Ready"] })] })] }))] })] }));
}
