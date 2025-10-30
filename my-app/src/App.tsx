import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [chats, setChats] = useState<any>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [inputMessage, setInputMessage] = useState<any>('');
  const [isLoading, setIsLoading] = useState<any>(false);
  const [streamingMessage, setStreamingMessage] = useState<any>('');
  const messagesEndRef = useRef<any>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3000/chats');
      const chatsData = await response.json();
      setChats(chatsData);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Fetch specific chat
  const fetchChat = async (chatId:any) => {
    try {
      const response = await fetch(`http://localhost:3000/chats/${chatId}`);
      const chatData = await response.json();
      setCurrentChat(chatData);
      
      // Transform backend messages to frontend format
      const transformedMessages = (chatData.messages || []).map((msg:any )=> ({
        id: msg.id?.toString() || Date.now().toString(),
        role: msg.role,
        content: msg.content,
        parts: msg.parts || [{ type: "text", text: msg.content }]
      }));
      
      setMessages(transformedMessages);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      const response = await fetch('http://localhost:3000/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const newChat = await response.json();
      setChats((prev:any) => [newChat, ...prev]);
      setCurrentChat(newChat);
      setMessages([]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Handle streaming response - UPDATED to match backend format
  const handleStreamResponse = async (chatId:any, userMessage:any) => {
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Prepare ALL messages including the new user message
      // This matches exactly what your backend expects
      const requestMessages = [
        ...messages.map((msg:any) => ({
          role: msg.role,
          content: msg.content,
          parts: [{ type: "text", text: msg.content }]
        })),
        {
          role: 'user',
          content: userMessage,
          parts: [{ type: "text", text: userMessage }]
        }
      ];

      console.log('Sending to backend - Messages:', requestMessages);

      const response:any = await fetch(
        chatId ? `http://localhost:3000/chat/${chatId}` : 'http://localhost:3000/chat', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: requestMessages  // This matches your backend ChatRequest interface
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('Received DONE signal');
              setIsLoading(false);
              
              if (accumulatedText.trim()) {
                const newAssistantMessage = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: accumulatedText,
                  parts: [{ type: "text", text: accumulatedText }]
                };
                
                setMessages((prev:any) => [...prev, newAssistantMessage]);
                setStreamingMessage('');
                
                // Refresh chats to get updated timestamps
                fetchChats();
                
                // Refresh current chat to get all messages from DB
                if (chatId) {
                  setTimeout(() => {
                    fetchChat(chatId);
                  }, 100);
                }
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'text-delta') {
                accumulatedText += parsed.textDelta;
                setStreamingMessage(accumulatedText);
              }
              
              if (parsed.type === 'error') {
                console.error('Stream error:', parsed.error);
                setIsLoading(false);
                setStreamingMessage('');
                alert(`Error: ${parsed.error} - ${parsed.details}`);
              }
            } catch (e) {
              console.log('Non-JSON data:', data);
            }
          }
        }
      }
    } catch (error:any) {
      console.error('Error during streaming:', error);
      setIsLoading(false);
      setStreamingMessage('');
      alert('Error sending message: ' + error.message);
    }
  };

  // Send message - FIXED VERSION
  const sendMessage = async () => {
    // Better validation for empty input
    if (!inputMessage || inputMessage.trim().length === 0 || isLoading) {
      console.log('Message is empty or loading, not sending');
      return;
    }

    const userMessage = inputMessage.trim();
    console.log('Sending message:', userMessage);
    
    // Clear input immediately
    setInputMessage('');
    console.log(userMessage)

    // Add user message to UI immediately for better UX
    const newUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      parts: [{ type: "text", text: userMessage }]
    };

    console.log('Adding user message to UI:', newUserMessage);
    setMessages((prev:any) => [...prev, newUserMessage]);

    try {
      // If no current chat, create one first
      if (!currentChat) {
        console.log('Creating new chat...');
        const title = userMessage.slice(0, 50) || 'New Chat';
        const response = await fetch('http://localhost:3000/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create chat: ${response.status}`);
        }
        
        const newChat = await response.json();
        console.log('New chat created:', newChat);
        
        setCurrentChat(newChat);
        setChats((prev:any) => [newChat, ...prev]);
        
        // Now send the message to the new chat
        // The user message is already in the messages state, so handleStreamResponse will include it
        await handleStreamResponse(newChat.id, userMessage);
      } else {
        console.log('Using existing chat:', currentChat.id);
        // Send to existing chat
        // The user message is already in the messages state, so handleStreamResponse will include it
        await handleStreamResponse(currentChat.id, userMessage);
      }
    } catch (error:any) {
      console.error('Error in sendMessage:', error);
      setIsLoading(false);
      // Remove the user message if failed
      setMessages((prev:any) => prev.filter((msg:any) => msg.id !== newUserMessage.id));
      alert('Failed to send message: ' + error.message);
    }
  };

  // Handle key press
  const handleKeyPress = (e:any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Delete chat
  const deleteChat = async (chatId:any, e:any) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await fetch(`http://localhost:3000/chats/${chatId}`, {
          method: 'DELETE',
        });
        
        setChats((prev:any) => prev.filter((chat:any) => chat.id !== chatId));
        
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }
        
        fetchChats();
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  // Load chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {chats.map((chat:any) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 group relative ${
                  currentChat?.id === chat.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => fetchChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(chat.updated_at).toLocaleDateString()} at{' '}
                      {new Date(chat.updated_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all duration-200"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">{currentChat.title}</h1>
                <div className="text-sm text-gray-500">
                  Chat #{currentChat.id}
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message:any) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1 opacity-80">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Streaming Message */}
                {streamingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm px-4 py-3">
                      <div className="text-sm font-medium mb-1 opacity-80">
                        Assistant
                      </div>
                      <div className="whitespace-pre-wrap">
                        {streamingMessage}
                        {isLoading && (
                          <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... (Press Enter to send)"
                      disabled={isLoading}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 self-end"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to AI Chat
              </h1>
              <p className="text-gray-600 mb-8">
                Start a new conversation with the AI assistant or select an existing chat from the sidebar.
              </p>
              <button
                onClick={createNewChat}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;