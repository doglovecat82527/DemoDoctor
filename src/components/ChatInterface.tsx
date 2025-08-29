import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguageStore, useTexts } from '../store/languageStore';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInterface({ messages: externalMessages, onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const { language } = useLanguageStore();
  const t = useTexts();
  const [messages, setMessages] = useState<Message[]>(externalMessages || [
    {
      id: '1',
      type: 'assistant',
      content: t.diagnosis.initialMessage,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      await onSendMessage(userMessage.content);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  // 当外部messages变化时更新内部状态
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
        <h1 className="text-2xl font-bold text-gray-800">{t.diagnosis.chatTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">{t.diagnosis.chatSubtitle}</p>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white ml-4'
                  : 'bg-gray-100 text-gray-800 mr-4'
              }`}
            >
              {message.type === 'assistant' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
              <div
                className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 mr-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">{t.diagnosis.analyzing}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        {/* 上传按钮区域 */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex space-x-2">
            <button
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              disabled
            >
              <FileText size={16} />
              <span>{t.diagnosis.uploadDoc}</span>
            </button>
            <button
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              disabled
            >
              <Upload size={16} />
              <span>{t.diagnosis.uploadImage}</span>
            </button>
            <span className="text-xs text-gray-400 self-center ml-2">{t.diagnosis.demoNotSupported}</span>
          </div>
        </div>
        
        {/* 输入框和发送按钮 */}
        <div className="flex items-end space-x-3 p-4">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.diagnosis.placeholder}
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Message, ChatInterfaceProps };