"use client";

import { useEffect } from "react";

// Declare custom Dialogflow elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'df-messenger': {
        location?: string;
        'project-id'?: string;
        'agent-id'?: string;
        'language-code'?: string;
        'max-query-length'?: string;
        children?: React.ReactNode;
      };
      'df-messenger-chat-bubble': {
        'chat-title'?: string;
        children?: React.ReactNode;
      };
    }
  }
}

export function DialogflowWidget() {
  useEffect(() => {
    // Add Dialogflow CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css";
    document.head.appendChild(link);

    // Add Dialogflow script
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js";
    script.async = true;
    document.head.appendChild(script);

    // Add custom styles
    const style = document.createElement("style");
    style.textContent = `
      df-messenger {
        z-index: 999;
        position: fixed;
        --df-messenger-font-color: #000;
        --df-messenger-font-family: Google Sans;
        --df-messenger-chat-background: #f3f6fc;
        --df-messenger-message-user-background: #d3e3fd;
        --df-messenger-message-bot-background: #fff;
        bottom: 16px;
        right: 16px;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <df-messenger
      location="us-central1"
      project-id={process.env.PROJECT_ID}
      agent-id={process.env.AGENT_ID}
      language-code="en"
      max-query-length="-1"
    >
      <df-messenger-chat-bubble chat-title="exam proctoring chatbot">
      </df-messenger-chat-bubble>
    </df-messenger>
  );
} 