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
  const [listining, setListining] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak the text
  useEffect(() => {
    const speechSynthesis = window.speechSynthesis;
    let utterance = new SpeechSynthesisUtterance(response);
    // When speech synthesis finishes, start listening
    utterance.onend = () => {
      startRecording();
    };
    speechSynthesis.speak(utterance);
  }, [response]);

  // Continue reccording
  function continueSpeaking(speechSynthesis) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    // Start listening while speaking
    recognition.start();

    // Variable to store transcript
    let currentTranscript = "";

    // Listen for speech events
    recognition.onresult = function (event) {
      currentTranscript = event.results[0][0].transcript;
      console.log("Detected speech:", currentTranscript);
    };

    // End listening when voice ends
    recognition.onspeechend = () => {
      recognition.stop();
      setListining(false);
      if (currentTranscript) {
        apiResponse(currentTranscript);
      }
    };

    // Cancel speech synthesis when user starts speaking
    recognition.onspeechstart = () => {
      speechSynthesis.cancel();
      console.log("User started speaking, canceling speech synthesis");
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      recognition.stop();
      setListining(false);
    };
  }

  // Start recording the voice
  function startRecording() {
    // If already listening, stop the recognition
    if (listining) {
      setListining(false);
      // If you have a reference to the active recognition instance, stop it
      if (window.currentRecognition) {
        window.currentRecognition.stop();
        window.currentRecognition = null;
      }
      return;
    }
    // Otherwise start listening
    setListining(true);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Store reference to stop it later
    window.currentRecognition = recognition;
    recognition.onresult = async function (event) {
      const transcript = event.results[0][0].transcript;
      console.log(transcript);
      setListining(false);
      apiResponse(transcript);
    };
    // Error handling code...
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setListining(false);
    };
    recognition.start();
  }

  // Handle sending a message
  async function apiResponse(transcript) {
    const prevMessages = messages;
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
      const chat = model.startChat({
        history: prevMessages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: 0.7,
        },
      });
      const prompt = `Give response like a 10 year kid. the response must be only text : ${transcript}`;
      let result = await chat.sendMessage(prompt);
      const aiText = result.response.text();
      setResponse(aiText);
      console.log(result.response.text());
      // Add AI response
      const aiMessage = {
        id: Date.now().toString(),
        content: aiText,
        role: "model",
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
        role: "model",
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
              className={`fixed rounded-full h-15 w-15 shadow-md cursor-pointer ${
                listining && "bg-red-500"
              }`}
            >
              <Mic />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
