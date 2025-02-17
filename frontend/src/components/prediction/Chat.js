import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chat({ onCountrySelect }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Initialize chat with welcome message
    useEffect(() => {
        setMessages([
            {
                type: 'bot',
                content: 'Hello! I can help you understand Leptospirosis risks across Europe. Ask me about any country!'
            }
        ]);
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', content: input }]);

        try {
            const response = await axios.post('/api/riskanalysis/chat', { message: input });

            // Add bot response
            setMessages(prev => [...prev, { type: 'bot', content: response.data.response }]);

            // Update parent component if country data is returned
            if (response.data.data) {
                onCountrySelect(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: 'Sorry, I encountered an error. Please try again.'
                }
            ]);
        }

        setInput('');
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 h-96">
            <div className="flex items-center mb-4 space-x-2">
                <div className="w-6 h-6 bg-teal-600 rounded-md"></div>
                <h3 className="font-medium text-gray-700">Diagnostic Assistant</h3>
            </div>

            <div className="h-64 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ask about symptoms or prevention..."
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;