import { startRecording } from "./speechToText";
export function textToSpeech(
  aiText,
  messages,
  setMessages,
  setIsLoading,
  setListining,
  setIsConversation
) {
  const speechSynthesis = window.speechSynthesis;
  let utterance = new SpeechSynthesisUtterance(aiText);

  utterance.onend = () => {
    console.log("Speech ended");
    startRecording(
      setIsConversation,
      setListining,
      setMessages,
      messages,
      setIsLoading
    );
  };
  speechSynthesis.speak(utterance);
  console.log("Speaking.....");
}
