"use client";

import React, { useState, useEffect } from "react";
import { Microphone } from "@mynaui/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App2 = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  // Start recording the voice
  function startRecording() {
    setIsLoading(true);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      
      // Add user message to conversation
      setConversation(prev => [...prev, { role: "user", content: transcript }]);
      
      // Only call API after we've set the text
      setTimeout(() => {
        if (transcript && transcript.trim() !== "") {
          apiResponse(transcript);
        } else {
          setIsLoading(false);
        }
      }, 100);
    };

    recognition.onerror = function(event) {
      console.error("Speech recognition error", event.error);
      setIsLoading(false);
    };

    recognition.start();
  }

  // api response
  async function apiResponse(transcript) {
    try {
      setIsLoading(true);
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      // Make sure we're passing the actual transcript
      const prompt = `Give human like response to this message. the response must be only text : ${transcript}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      setResponse(responseText);
      
      // Add bot response to conversation
      setConversation(prev => [...prev, { role: "bot", content: responseText }]);
      
      // Speak the response
      speakResponse(responseText);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setResponse("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Speak the text
  function speakResponse(text) {
    if (text) {
      let utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      <Card>
        <CardHeader>
          <CardTitle>Chat Bot</CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {conversation.length > 0 ? (
              conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-4 p-2 rounded-lg ${
                    msg.role === "user" 
                      ? "bg-blue-100 text-left" 
                      : "bg-gray-100 text-left"
                  }`}
                >
                  <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.content}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center p-4">
                Click the microphone to start talking
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="justify-center">
          <Button 
            onClick={startRecording} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? "Processing..." : "Speak"}
            <Microphone className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default App2;