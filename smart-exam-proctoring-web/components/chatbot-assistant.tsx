"use client";

import { useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  HelpCircle,
  AlertTriangle,
  Settings,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

const quickActions = [
  {
    icon: HelpCircle,
    label: "How does AI detect cheating?",
    message: "How does the AI system detect cheating behaviors?",
  },
  {
    icon: AlertTriangle,
    label: "Explain alert types",
    message:
      "Can you explain the different types of alerts and their severity levels?",
  },
  {
    icon: Settings,
    label: "System troubleshooting",
    message: "I need help troubleshooting system issues",
  },
  {
    icon: Bug,
    label: "Report technical issue",
    message: "I want to report a technical issue",
  },
];

export function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your ProctorView assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes("ai") && message.includes("detect")) {
      return "Our AI system uses computer vision and machine learning to detect suspicious behaviors including: looking away from screen, additional people in frame, unauthorized devices, unusual movements, and audio anomalies. The system analyzes webcam feeds and screen recordings in real-time.";
    }

    if (message.includes("alert") && message.includes("type")) {
      return "Alert types include:\n\n• **High Severity**: Person detected, phone/device detected, screen sharing violations\n• **Medium Severity**: Looking away, suspicious movements, audio anomalies\n• **Low Severity**: Minor behavioral flags, brief distractions\n\nEach alert includes timestamp, description, and recommended actions.";
    }

    if (message.includes("troubleshoot") || message.includes("issue")) {
      return "For technical issues, please check:\n\n1. Internet connection stability\n2. Browser compatibility (Chrome recommended)\n3. Camera and microphone permissions\n4. Clear browser cache if needed\n\nIf issues persist, contact technical support with error details.";
    }

    if (message.includes("report") && message.includes("technical")) {
      return 'To report a technical issue:\n\n1. Note the exact error message\n2. Record steps to reproduce the issue\n3. Include browser and system information\n4. Use the "Report Issue" button in settings\n\nOur technical team will respond within 2 hours during exam periods.';
    }

    return "I understand you need help. Could you please provide more details about your question? You can also use the quick action buttons below for common topics.";
  };

  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    handleSendMessage(action.message);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 z-50"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">ProctorView Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4 max-h-64">
          <div className="space-y-3 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    {message.type === "bot" ? (
                      <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <AvatarFallback className="text-xs">You</AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm break-words ${
                      message.type === "user"
                        ? "bg-blue-900 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto p-2 flex flex-col items-center space-y-1 bg-transparent"
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-sm"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(inputValue);
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
