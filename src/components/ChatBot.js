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
import { Mic } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

// Changed to default export
export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak the text
  useEffect(() => {
    const speechSynthesis = window.speechSynthesis;
    let utterance = new SpeechSynthesisUtterance(response);
    speechSynthesis.speak(utterance);
  }, [response]);

  // Start recording the voice
  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = async function (event) {
      const transcript = event.results[0][0].transcript;
      // setText(transcript);
      console.log(transcript);
      apiResponse(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);

      switch (event.error) {
        case "no-speech":
          alert("No speech detected. Please try again.");
          break;
        case "audio-capture":
          alert("Microphone not found. Please check your device.");
          break;
        case "not-allowed":
          alert("Permission denied. Allow microphone access in settings.");
          break;
        case "network":
          alert("Network error. Please check your internet connection.");
          break;
        default:
          alert("An unknown error occurred: " + event.error);
      }
    };
    recognition.start();
  }

  // Handle sending a message
  async function apiResponse(transcript) {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: transcript,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("Sending message to API...");

      // Call API route that interacts with Gemini
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      );

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `Give human like response to this message. the response must be only text : ${transcript}`;

      const result = await model.generateContent(prompt);
      const aiText = result.response.text();
      setResponse(aiText);
      console.log(result.response.text());

      // Add AI response
      const aiMessage = {
        id: Date.now().toString(),
        content: aiText,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in chat:", error);

      const errorMessage = {
        id: Date.now().toString(),
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please check your internet connection and try again.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Chat window */}
      <div className={`fixed bottom-15 right-20 w-96 z-5`}>
        <Card className="shadow-xl border-2">
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Chat Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
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
                        className={`max-w-xs rounded-lg px-4 py-2 ${
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

          <CardFooter className="p-4 border-t flex justify-center">
            <Button
              onClick={startRecording}
              className="fixed rounded-full h-15 w-15 shadow-md cursor-pointer"
            >
              <Mic />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
