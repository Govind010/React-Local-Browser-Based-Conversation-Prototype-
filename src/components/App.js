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

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      console.log(transcript);
      apiResponse();
    };

    recognition.start();
  }


  async function apiResponse() {
    const genAI = new GoogleGenerativeAI("AIzaSyC0VzO4OUxyfi-9W8c9bz4cqBtzES4vEwo"); 

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `Give human like response to this message : ${text}`;

    const result = await model.generateContent(prompt);
    setResponse(result.response.text);
    console.log(result.response.text());
  }

  // Speak the text
  useEffect(() => {
    let utterance = new SpeechSynthesisUtterance(response);
    window.speechSynthesis.speak(utterance);
  }, [response]);

  return (
    <div className="w-full max-w-md text-center ">
      <Card>
        <CardHeader>
          <CardTitle>Chat Bot</CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div>{text}</div>
          </ScrollArea>
        </CardContent>

        <CardFooter>
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
