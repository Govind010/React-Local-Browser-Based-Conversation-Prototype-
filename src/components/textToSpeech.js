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
  const cleanText = aiText.replace(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
    ""
  );
  utterance.text = cleanText;
  utterance.rate = 1.4;
  utterance.pitch = 0.9;
  utterance.volume = 1.0;

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
