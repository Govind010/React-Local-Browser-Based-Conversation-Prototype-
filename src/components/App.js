"use client";

import React, { use, useState, useEffect } from "react";
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

const App = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  // Start recording the voice
  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = async function (event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
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

  // api response
  async function apiResponse(transcript) {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `Give human like response to this message. the response must be only text : ${transcript}`;

    const result = await model.generateContent(prompt);
    setResponse(result.response.text());
    console.log(result.response.text());
  }

  // Speak the text
  useEffect(() => {
    const speechSynthesis = window.speechSynthesis;
    let utterance = new SpeechSynthesisUtterance(response);
    speechSynthesis.speak(utterance);
  }, [response]);

  return (
    <div className="w-full max-w-md text-center ">
      <Card>
        <CardHeader>
          <CardTitle>Chat Bot</CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            {text ? (
              <>
                <div className="mb-4 p-2 rounded-lg bg-blue-100 text-left">
                  <b>You: </b> {text}
                </div>
                <div className="mb-4 p-2 rounded-lg bg-gray-100 text-left">
                  <b>Bot: </b> {response}
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-center p-4">
                Click the microphone to start talking
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={startRecording}>
            Click me
            <Microphone />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default App;
