"use client";

import { useEffect, useState } from "react";

export function DialogflowWidget() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add Dialogflow CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css";
    document.head.appendChild(link);

    // Add Dialogflow script
    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
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
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  // Don't render anything until script is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <df-messenger
            location="us-central1"
            project-id="${process.env.NEXT_PUBLIC_PROJECT_ID || ""}"
            agent-id="${process.env.NEXT_PUBLIC_AGENT_ID || ""}"
            language-code="en"
            max-query-length="-1"
          >
            <df-messenger-chat-bubble chat-title="exam proctoring chatbot">
            </df-messenger-chat-bubble>
          </df-messenger>
        `,
      }}
    />
  );
}
