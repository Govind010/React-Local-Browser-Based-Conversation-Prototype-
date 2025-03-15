"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { startRecording, stopRecording } from "./speechToText";

export default function ChatBot() {
  const [isConversation, setIsConversation] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listining, setListining] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat window */}
      <div className={` w-80 fixed`}>
        <Card className="shadow-xl border-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Chat Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96 px-1 border-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-8 text-gray-500">
                  <p>Hello! How can I help you today?</p>
                </div>
              ) : (
                <div className="space-y-4 pt-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-48 rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div className="text-sm markdown-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-xs rounded-lg px-4 py-2 bg-muted">
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className={`p-4 pt-0 w-full flex justify-center`}>
            <Button
              onClick={() => {
                console.log("Clicked on cancel");
                isConversation
                  ? stopRecording(setIsConversation, setListining)
                  : startRecording(
                      setIsConversation,
                      setListining,
                      setMessages,
                      messages,
                      setIsLoading
                    );
              }}
              className={`fixed rounded-full h-15 w-15 shadow-md cursor-pointer ${
                listining && "bg-red-500 hover:bg-red-400"
              }`}
            >
              {isConversation ? <XCircle /> : <Mic />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
