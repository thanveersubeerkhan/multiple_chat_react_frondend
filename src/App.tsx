

// import { useState, useCallback } from "react";
// import { nanoid } from "nanoid";
// import { Conversation } from "./components/ai-elements/conversation";
// import { Message,MessageContent,MessageAvatar } from "./components/ai-elements/message";
// // import { PromptInput, PromptInputTextarea, PromptInputSubmi
// import { useChat } from '@ai-sdk/react'

// import { Response } from "./components/ai-elements/response";
// import { PromptInput, PromptInputTextarea, PromptInputSubmit } from "./components/ai-elements/prompt-input";
// import { DefaultChatTransport } from "ai";

// type MessageType = {
//   id: string;
//   from: "user" | "assistant";
//   content: string;
// };

// export default function App() {
  
//   const {messages, sendMessage,status} = useChat<any>({
//     transport:new DefaultChatTransport({
//       api:'https://multiple-chat-react-backend.onrender.com/chat'
//     })
//   });
//   const [input, setInput] = useState("");


 

//   const handleSubmit = useCallback(async () => {
//     if (!input.trim()) return;
//    sendMessage({ text: input });
//     setInput("");
  


//   }, [input]);

//   return (
//     <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50">
//       <Conversation className="flex-1 overflow-y-auto p-4 space-y-3">
//    {messages.map((msg) => (
//         <Message from={msg.role} key={msg.id}>
//           <MessageAvatar
//             name={msg.role === 'user' ? 'You' : 'AI'}
//             src={
//               msg.role === 'user'
//                 ? 'https://github.com/haydenbleasel.png'
//                 : 'https://github.com/openai.png'
//             }
//           />
//           <MessageContent>
//             {msg.parts.map((part, i) => {
//               if (part.type === 'text') {
//                 return <Response key={`${msg.id}-${i}`}>{part.text}</Response>;
//               }
//               return null;
//             })}
//           </MessageContent>
//         </Message>
//       ))}
//       </Conversation>

//       <div className="p-4 border-t bg-white">
//         <PromptInput onSubmit={handleSubmit}>
//           <PromptInputTextarea
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             placeholder="Ask me anything..."
//           />
//           <PromptInputSubmit status={status} />
//         </PromptInput>
//       </div>
//     </div>
//   );
// }
// import { useState, useCallback, useEffect, useRef } from "react";

// // Types
// interface Chat {
//   id: number;
//   title: string;
//   created_at: string;
//   updated_at: string;
// }

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
// }

// export default function App() {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [currentChat, setCurrentChat] = useState<Chat | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isLoadingChats, setIsLoadingChats] = useState(false);
//   const [isLoadingMessages, setIsLoadingMessages] = useState(false);
//   const [input, setInput] = useState("");
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const conversationRef = useRef<HTMLDivElement>(null);

//   // Scroll to bottom of messages
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ 
//         behavior: "smooth",
//         block: "end"
//       });
//     }
//   }, [messages, isStreaming]);

//   // Auto-scroll when new messages arrive during streaming
//   useEffect(() => {
//     if (isStreaming && conversationRef.current) {
//       conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
//     }
//   }, [messages, isStreaming]);

//   // Auto-rename chat based on first user message
//   const autoRenameChat = useCallback(async (chatId: number, userMessage: string) => {
//     try {
//       // Extract a title from the user message (first 4-6 words)
//       const words = userMessage.trim().split(/\s+/).slice(0, 6);
//       let newTitle = words.join(' ');
      
//       // Clean up the title
//       newTitle = newTitle
//         .replace(/[^\w\s]/gi, '') // Remove special characters
//         .trim();
      
//       if (newTitle.length > 50) {
//         newTitle = newTitle.substring(0, 47) + '...';
//       }
      
//       if (newTitle.length > 3) { // Only rename if we have meaningful content
//         const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ title: newTitle }),
//         });
        
//         if (response.ok) {
//           fetchChats(); // Refresh chat list
//         }
//       }
//     } catch (error) {
//       console.error('Error auto-renaming chat:', error);
//     }
//   }, []);

//   // Fetch all chats
//   const fetchChats = useCallback(async () => {
//     try {
//       setIsLoadingChats(true);
//       setError(null);
//       const response = await fetch('https://multiple-chat-react-backend.onrender.com/chats');
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch chats: ${response.status}`);
//       }
      
//       const chatsData = await response.json();
//       setChats(chatsData);
//     } catch (error) {
//       console.error('Error fetching chats:', error);
//       setError('Failed to load chats');
//     } finally {
//       setIsLoadingChats(false);
//     }
//   }, []);

//   // Fetch a specific chat with all its messages
//   const fetchChat = useCallback(async (chatId: number) => {
//     try {
//       setIsLoadingMessages(true);
//       setError(null);
//       const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`);
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch chat: ${response.status}`);
//       }
      
//       const chatData = await response.json();
      
//       // Set current chat
//       setCurrentChat({
//         id: chatData.id,
//         title: chatData.title,
//         created_at: chatData.created_at,
//         updated_at: chatData.updated_at
//       });
      
//       // Set messages
//       if (chatData.messages && chatData.messages.length > 0) {
//         const convertedMessages: Message[] = chatData.messages.map((msg: any) => ({
//           id: msg.id.toString(),
//           role: msg.role,
//           content: msg.content
//         }));
//         setMessages(convertedMessages);
//       } else {
//         setMessages([]);
//       }
//     } catch (error) {
//       console.error('Error fetching chat:', error);
//       setError('Failed to load chat');
//     } finally {
//       setIsLoadingMessages(false);
//     }
//   }, []);

//   // Create a new chat
//   const createNewChat = useCallback(async () => {
//     try {
//       setError(null);
//       const response = await fetch('https://multiple-chat-react-backend.onrender.com/chats', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title: 'New Chat' }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to create chat: ${response.status}`);
//       }
      
//       const newChat = await response.json();
//       setCurrentChat(newChat);
//       setMessages([]);
//       setInput("");
//       await fetchChats();
//     } catch (error) {
//       console.error('Error creating chat:', error);
//       setError('Failed to create chat');
//     }
//   }, [fetchChats]);

//   // Delete a chat
//   const deleteChat = useCallback(async (chatId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
    
//     try {
//       setError(null);
//       const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`, {
//         method: 'DELETE',
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to delete chat: ${response.status}`);
//       }
      
//       if (currentChat && currentChat.id === chatId) {
//         setCurrentChat(null);
//         setMessages([]);
//         setInput("");
//       }
      
//       fetchChats();
//     } catch (error) {
//       console.error('Error deleting chat:', error);
//       setError('Failed to delete chat');
//     }
//   }, [currentChat, fetchChats]);

//   // Update chat title
//   const updateChatTitle = useCallback(async (chatId: number, newTitle: string) => {
//     try {
//       setError(null);
//       const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title: newTitle }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to update chat title: ${response.status}`);
//       }
      
//       fetchChats();
//     } catch (error) {
//       console.error('Error updating chat title:', error);
//       setError('Failed to update chat title');
//     }
//   }, [fetchChats]);

//   // Send message to backend
//   const sendMessage = useCallback(async (message: string) => {
//     if (!message.trim()) return;

//     try {
//       setIsStreaming(true);
//       setError(null);

//       // Add user message to UI immediately
//       const userMessage: Message = {
//         id: Date.now().toString(),
//         role: 'user',
//         content: message
//       };
//       setMessages(prev => [...prev, userMessage]);

//       const apiUrl = currentChat 
//         ? `https://multiple-chat-react-backend.onrender.com/chat/${currentChat.id}`
//         : 'https://multiple-chat-react-backend.onrender.com/chat';

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           messages: [
//             {
//               role: 'user',
//               parts: [{ type: 'text', text: message }]
//             }
//           ]
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       // Handle streaming response
//       const reader = response.body?.getReader();
//       if (!reader) {
//         throw new Error('No response body');
//       }

//       let assistantMessage = '';
//       const assistantMessageId = (Date.now() + 1).toString();

//       // Add empty assistant message to UI
//       setMessages(prev => [...prev, {
//         id: assistantMessageId,
//         role: 'assistant',
//         content: ''
//       }]);

//       while (true) {
//         const { done, value } = await reader.read();
        
//         if (done) break;

//         const chunk = new TextDecoder().decode(value);
//         const lines = chunk.split('\n');

//         for (const line of lines) {
//           if (line.startsWith('data: ')) {
//             const data = line.slice(6).trim();
            
//             if (data === '[DONE]') {
//               break;
//             }

//             if (data) {
//               try {
//                 const parsed = JSON.parse(data);
//                 if (parsed.type === 'text-delta' && parsed.textDelta) {
//                   assistantMessage += parsed.textDelta;
                  
//                   // Update the assistant message in real-time
//                   setMessages(prev => prev.map(msg => 
//                     msg.id === assistantMessageId 
//                       ? { ...msg, content: assistantMessage }
//                       : msg
//                   ));
//                 }
//               } catch (e) {
//                 // Ignore JSON parse errors for non-data chunks
//               }
//             }
//           }
//         }
//       }

//       // Refresh chats to get updated timestamps
//       await fetchChats();

//       // Handle auto-renaming and new chat creation
//       if (!currentChat && response.headers.get('X-Chat-Id')) {
//         const chatId = response.headers.get('X-Chat-Id');
//         if (chatId) {
//           // Auto-rename the new chat based on the first message
//           autoRenameChat(parseInt(chatId), message);
          
//           // Set as current chat after a delay
//           setTimeout(() => {
//             fetchChats().then(() => {
//               const newChat = chats.find(chat => chat.id.toString() === chatId);
//               if (newChat) {
//                 setCurrentChat(newChat);
//               }
//             });
//           }, 500);
//         }
//       } else if (currentChat && currentChat.title === 'New Chat' && messages.length === 0) {
//         // Auto-rename existing "New Chat" after first message
//         autoRenameChat(currentChat.id, message);
//       }

//     } catch (error) {
//       console.error('Error sending message:', error);
//       setError('Failed to send message');
      
//       // Remove the empty assistant message if there was an error
//       setMessages(prev => prev.filter(msg => msg.content !== ''));
//     } finally {
//       setIsStreaming(false);
//     }
//   }, [currentChat, fetchChats, chats, autoRenameChat, messages.length]);

//   // Handle form submission
//   const handleSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isStreaming) return;

//     sendMessage(input);
//     setInput("");
//   }, [input, isStreaming, sendMessage]);

//   // Handle input changes
//   const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value);
//   }, []);

//   // Auto-resize textarea
//   const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
    
//     // Auto-resize
//     const textarea = e.currentTarget;
//     setTimeout(() => {
//       textarea.style.height = 'auto';
//       textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
//     }, 0);
//   }, [handleSubmit]);

//   // Load chats on mount
//   useEffect(() => {
//     fetchChats();
//   }, [fetchChats]);

//   const formatDate = (dateString: string) => {
//     const date:any = new Date(dateString);
//     const now:any = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays} days ago`;
    
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
//         <div className="p-4 border-b border-gray-200">
//           <button
//             onClick={createNewChat}
//             className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//           >
//             <span>+</span>
//             <span>New Chat</span>
//           </button>
//         </div>
        
//         <div className="flex-1 overflow-y-auto">
//           {isLoadingChats ? (
//             <div className="p-4 text-center text-gray-500">Loading chats...</div>
//           ) : chats.length === 0 ? (
//             <div className="p-4 text-center text-gray-500">No chats yet</div>
//           ) : (
//             <div className="p-2">
//               {chats.map((chat) => (
//                 <div
//                   key={chat.id}
//                   className={`p-3 rounded-lg cursor-pointer mb-1 transition-colors group ${
//                     currentChat?.id === chat.id 
//                       ? 'bg-blue-50 border border-blue-200' 
//                       : 'hover:bg-gray-50'
//                   }`}
//                   onClick={() => fetchChat(chat.id)}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium text-gray-900 truncate flex items-center gap-2">
//                         <span>{chat.title}</span>
//                         {chat.title === 'New Chat' && (
//                           <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">New</span>
//                         )}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {formatDate(chat.updated_at)}
//                       </div>
//                     </div>
//                     <button
//                       onClick={(e) => deleteChat(chat.id, e)}
//                       className="ml-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* Status info */}
//         <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
//           <div>Chats: {chats.length}</div>
//           <div>Current: {currentChat ? `#${currentChat.id}` : 'None'}</div>
//           <div>Messages: {messages.length}</div>
//           <div>Status: {isLoadingMessages ? 'Loading...' : isStreaming ? 'Streaming...' : 'Ready'}</div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className="border-b border-gray-200 bg-white p-4 flex items-center">
//           <button
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
//           >
//             ☰
//           </button>
          
//           {currentChat ? (
//             <div className="flex-1 flex items-center gap-2">
//               <input
//                 type="text"
//                 value={currentChat.title}
//                 onChange={(e) => setCurrentChat({ ...currentChat, title: e.target.value })}
//                 onBlur={(e) => {
//                   if (e.target.value.trim()) {
//                     updateChatTitle(currentChat.id, e.target.value.trim());
//                   } else {
//                     setCurrentChat({ ...currentChat, title: 'New Chat' });
//                     updateChatTitle(currentChat.id, 'New Chat');
//                   }
//                 }}
//                 className="text-lg font-semibold bg-transparent border-none outline-none flex-1"
//                 placeholder="Chat title..."
//               />
//               {currentChat.title === 'New Chat' && (
//                 <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Auto-rename after first message</span>
//               )}
//             </div>
//           ) : (
//             <div className="text-lg font-semibold text-gray-500">
//               {messages.length > 0 ? 'New Chat (will auto-rename)' : 'Start a new conversation'}
//             </div>
//           )}
          
//           {error && (
//             <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded">
//               {error}
//             </div>
//           )}
//         </div>

//         {/* Chat Area */}
//         <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
//           {isLoadingMessages ? (
//             <div className="flex-1 flex items-center justify-center">
//               <div className="text-center text-gray-500">
//                 <div className="text-lg">Loading messages...</div>
//               </div>
//             </div>
//           ) : messages.length === 0 && !currentChat ? (
//             <div className="flex-1 flex items-center justify-center">
//               <div className="text-center text-gray-500">
//                 <div className="text-2xl mb-2">👋</div>
//                 <div className="text-lg font-medium mb-2">Welcome to AI Chat</div>
//                 <div className="text-sm">Start a conversation by typing a message below</div>
//               </div>
//             </div>
//           ) : (
//             <div 
//               ref={conversationRef}
//               className="flex-1 overflow-y-auto p-4 space-y-6"
//             >
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
//                 >
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
//                     msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
//                   }`}>
//                     {msg.role === 'user' ? 'U' : 'AI'}
//                   </div>
//                   <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
//                     <div className={`inline-block px-4 py-2 rounded-2xl ${
//                       msg.role === 'user' 
//                         ? 'bg-blue-500 text-white' 
//                         : 'bg-gray-200 text-gray-800'
//                     }`}>
//                       <div className="whitespace-pre-wrap">{msg.content}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
              
//               {isStreaming && (
//                 <div className="flex gap-4">
//                   <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
//                     AI
//                   </div>
//                   <div className="flex-1 max-w-3xl">
//                     <div className="inline-block px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
//                       <div className="flex items-center gap-2">
//                         <div className="flex gap-1">
//                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
//                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                           <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                         </div>
//                         Thinking...
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               <div ref={messagesEndRef} />
//             </div>
//           )}

//           {/* Input Area */}
//           <div className="p-4 border-t bg-white">
//             <form onSubmit={handleSubmit} className="flex gap-2">
//               <textarea
//                 value={input}
//                 onChange={handleInputChange}
//                 onKeyDown={handleTextareaKeyDown}
//                 placeholder="Ask me anything..."
//                 disabled={isStreaming || isLoadingMessages}
//                 className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 rows={1}
//                 style={{ minHeight: '44px', maxHeight: '120px' }}
//               />
//               <button
//                 type="submit"
//                 disabled={!input.trim() || isStreaming || isLoadingMessages}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-16"
//               >
//                 {isStreaming ? (
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1">
//                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
//                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                     </div>
//                   </div>
//                 ) : (
//                   'Send'
//                 )}
//               </button>
//             </form>
            
//             {/* Status info */}
//             <div className="mt-2 text-xs text-gray-500 flex justify-between">
//               <span>Chat: {currentChat ? `#${currentChat.id}` : 'New'}</span>
//               <span>Messages: {messages.length}</span>
//               <span>Status: {isLoadingMessages ? 'Loading...' : isStreaming ? 'Streaming...' : 'Ready'}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useCallback, useEffect, useRef } from "react";
import { Send, Menu, X, Plus, Trash2, Sparkles, Zap, MessageCircle } from "lucide-react";


// Types
interface Chat {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIElements, setShowAIElements] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null)

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
      const response = await fetch("https://multiple-chat-react-backend.onrender.com/chats");

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status}`);
      }

      const chatsData = await response.json();
      setChats(chatsData);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const fetchChat = useCallback(async (chatId: number) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`);

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
        const convertedMessages: Message[] = chatData.messages.map(
          (msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
          })
        );
        setMessages(convertedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      setError("Failed to load chat");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("https://multiple-chat-react-backend.onrender.com/chats", {
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
    } catch (error) {
      console.error("Error creating chat:", error);
      setError("Failed to create chat");
    }
  }, [fetchChats]);

  const deleteChat = useCallback(
    async (chatId: number, e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        setError(null);
        const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`, {
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
      } catch (error) {
        console.error("Error deleting chat:", error);
        setError("Failed to delete chat");
      }
    },
    [currentChat, fetchChats]
  );

  const updateChatTitle = useCallback(
    async (chatId: number, newTitle: string) => {
      try {
        setError(null);
        const response = await fetch(`https://multiple-chat-react-backend.onrender.com/chats/${chatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update chat title: ${response.status}`);
        }

        fetchChats();
      } catch (error) {
        console.error("Error updating chat title:", error);
        setError("Failed to update chat title");
      }
    },
    [fetchChats]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      try {
        setIsStreaming(true);
        setError(null);
        setShowAIElements(false);

        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: message,
        };
        setMessages((prev) => [...prev, userMessage]);

        const apiUrl = currentChat
          ? `https://multiple-chat-react-backend.onrender.com/chat/${currentChat.id}`
          : "https://multiple-chat-react-backend.onrender.com/chat";

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

          if (done) break;

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

                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantMessage }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  // Ignore JSON parse errors for non-data chunks
                }
              }
            }
          }
        }

        await fetchChats();
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg.content !== ""));
      } finally {
        setIsStreaming(false);
      }
    },
    [currentChat, fetchChats]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;

      sendMessage(input);
      setInput("");
    },
    [input, isStreaming, sendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }

      const textarea = e.currentTarget;
      setTimeout(() => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
      }, 0);
    },
    [handleSubmit]
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const formatDate = (dateString: string) => {
    const date: any = new Date(dateString);
    const now: any = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-80`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-700/30 flex-shrink-0">
          <button
            onClick={createNewChat}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-blue-500/50"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="p-6 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="animate-spin text-2xl">⚙️</div>
              <span className="text-sm">Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="text-3xl">💬</div>
              <span className="text-sm">No chats yet</span>
              <span className="text-xs text-slate-500">Create one to get started</span>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentChat?.id === chat.id
                      ? "bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                      : "hover:bg-slate-700/30 border border-transparent hover:border-slate-600/50"
                  }`}
                  onClick={() => fetchChat(chat.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate text-sm leading-tight">
                        {chat.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full inline-block"></span>
                        {formatDate(chat.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="ml-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700/30 bg-slate-900/50 space-y-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700/30 rounded-lg p-2 text-slate-300">
              <div className="font-semibold text-blue-400">{chats.length}</div>
              <div className="text-slate-400">Chats</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-2 text-slate-300">
              <div className="font-semibold text-blue-400">{messages.length}</div>
              <div className="text-slate-400">Messages</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{isStreaming ? "Thinking..." : "Ready"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white flex-shrink-0"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="h-8 w-px bg-slate-700/30"></div>

            {currentChat ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                <input
                  type="text"
                  value={currentChat.title}
                  onChange={(e) =>
                    setCurrentChat({ ...currentChat, title: e.target.value })
                  }
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      updateChatTitle(
                        currentChat.id,
                        e.target.value.trim()
                      );
                    } else {
                      setCurrentChat({
                        ...currentChat,
                        title: "New Chat",
                      });
                      updateChatTitle(currentChat.id, "New Chat");
                    }
                  }}
                  className="text-lg font-semibold bg-transparent border-none outline-none text-white placeholder-slate-500 truncate"
                  placeholder="Chat title..."
                />
              </div>
            ) : (
              <div className="text-lg font-semibold text-slate-400 truncate">
                {messages.length > 0
                  ? "New Chat"
                  : "Start a conversation"}
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg flex items-center gap-2 flex-shrink-0 ml-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}
        </div>

        {/* Chat Area - Fixed Height with Scroll */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-3xl animate-spin">⚙️</div>
                <div className="text-slate-400">Loading messages...</div>
              </div>
            </div>
          ) : messages.length === 0 && !currentChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <div className="text-2xl font-bold text-white mb-3">
                  Welcome to Chat
                </div>
                <div className="text-slate-400 mb-6 max-w-xs">
                  Start a conversation by typing a message below or create a
                  new chat
                </div>
                <button
                  onClick={createNewChat}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/50 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Chat
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={conversationRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                    }`}
                  >
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  <div
                    className={`flex-1 max-w-2xl ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-5 py-3 rounded-2xl backdrop-blur-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-br-none"
                          : "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg shadow-slate-900/20 rounded-bl-none border border-slate-600/50"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg shadow-emerald-500/30">
                    AI
                  </div>
                  <div className="flex-1 max-w-2xl">
                    <div className="inline-block px-5 py-3 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg shadow-slate-900/20 rounded-bl-none border border-slate-600/50">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-300">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* AI Elements Quick Actions */}
        {!isStreaming && messages.length > 0 && (
          <div className="px-6 pb-3 flex-shrink-0">
            <button
              onClick={() => setShowAIElements(!showAIElements)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Sparkles size={16} />
              {showAIElements ? "Hide" : "Show"} AI Elements
            </button>
            {showAIElements && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {AI_ELEMENTS.map((element, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowAIElements(false);
                      sendMessage(element.prompt);
                    }}
                    disabled={isStreaming}
                    className="p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/30 hover:border-blue-500/50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="text-xl mb-1">{element.icon}</div>
                    <div className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors">
                      {element.title}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Area - Fixed at Bottom */}
        {messages.length!=0&&<div className="border-t border-slate-700/30 bg-gradient-to-t from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-6 flex-shrink-0">
          <div className="flex gap-3 max-w-5xl">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              disabled={isStreaming || isLoadingMessages}
              className="flex-1 border border-slate-600/50 rounded-xl px-5 py-3 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-blue-500/20 resize-none disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 transition-all duration-200"
              rows={1}
              style={{ minHeight: "48px", maxHeight: "100px" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming || isLoadingMessages}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-fit font-medium shadow-lg hover:shadow-blue-500/50 disabled:shadow-none flex-shrink-0"
            >
              {isStreaming ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* Input Status */}
          <div className="mt-3 flex justify-between items-center text-xs text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Chat: {currentChat ? `#${currentChat.id}` : "New"}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              {isLoadingMessages
                ? "Loading..."
                : isStreaming
                  ? "Streaming..."
                  : "Ready"}
            </span>
          </div>
        </div>}
      </div>
    </div>
  );
}