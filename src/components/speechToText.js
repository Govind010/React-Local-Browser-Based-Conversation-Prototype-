import { apiResponse } from "./apiResponse";
let recognition = null;

export function startRecording(
  setIsConversation,
  setListining,
  setMessages,
  messages,
  setIsLoading
) {
  setIsConversation(true);
  setListining(true);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.onresult = async function (event) {
    // window.speechSynthesis.cancel();
    console.log(event);
    const transcript = event.results[0][0].transcript;
    console.log("Result of ASR: " + transcript);
    apiResponse(
      transcript,
      messages,
      setMessages,
      setIsLoading,
      setListining,
      setIsConversation
    );
  };

  recognition.onspeechstart = () => {
    console.log("speech detected...");
    // window.speechSynthesis.cancel();
  };

  recognition.onend = () => {
    setListining(false);
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    setListining(false);
    setIsConversation(false);
  };
  recognition.start();
  console.log("Listening...");
}

export function stopRecording(setIsConversation, setListining) {
  setIsConversation(false);
  window.speechSynthesis.cancel();
  setListining(false);
  if (recognition) {
    recognition.stop();
  }
}
