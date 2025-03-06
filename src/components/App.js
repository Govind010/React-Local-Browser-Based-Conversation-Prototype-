"use client";

import React, { useState } from "react";
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

const App = () => {
  const [text, setText] = useState("");

  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      console.log(transcript);
      speek();
    };

    recognition.start();
  }

  function speek() {
    let utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

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
