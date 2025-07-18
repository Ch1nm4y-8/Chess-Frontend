import React, { useEffect, useRef, useState } from "react";
import "remixicon/fonts/remixicon.css";
import { MessagesType, playersDetailsType } from "../types/gameTypes";

interface ChatViewProps {
  sendChatHandler: (message: string) => void;
  messages: MessagesType[];
  playerDetails: playersDetailsType;
}

const ChatView = ({ sendChatHandler, messages, playerDetails }: ChatViewProps) => {
  const [messageToBeSent, setMessageToBeSent] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessageHandler = () => {
    if (messageToBeSent) {
      sendChatHandler(messageToBeSent);
      setMessageToBeSent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessageHandler();
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#111111] border-1 border-[#444444] rounded-t-sm h-[50vh] w-[100%]">
      <h1 className="text-center text-3xl ">CHAT</h1>

      <div className="flex flex-col justify-between h-[100%]">
        <div className="h-[90%] overflow-y-auto">
          {messages.map((messageObj, index) => {
            if (messageObj?.type == "info") {
              return (
                <div key={index} className="bg-gray-800 mt-2 mb-1">
                  {">>> " + messageObj.message}
                </div>
              );
            } else {
              return (
                <div key={index} className={`chat ${playerDetails.myPlayerName === messageObj.userName ? "chat-end" : "chat-start"}`}>
                  <div className="chat-header">{messageObj?.userName || "Obi-Wan Kenobi"}</div>
                  <div className="chat-bubble chat-bubble-success break-words">{messageObj.message}</div>
                </div>
              );
            }
          })}
          <div ref={chatRef}></div>
        </div>

        <label className="input w-full">
          <input onKeyDown={handleKeyDown} type="text" value={messageToBeSent} className="w-full" placeholder="Enter Message" onChange={(e) => setMessageToBeSent(e.target.value)} />
          <i
            onClick={() => {
              sendMessageHandler();
            }}
            className="ri-telegram-2-fill cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default ChatView;
