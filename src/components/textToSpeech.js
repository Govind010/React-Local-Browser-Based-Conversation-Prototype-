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
  utterance.text = cleanText.replace(/[,]/g, " ...");
  let voices = speechSynthesis.getVoices();

  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      utterance.voice =
        voices.find(
          (voice) => voice.name === "Microsoft Zira - English (United States)"
        ) || voices[0];
      speechSynthesis.speak(utterance);
    };
  } else {
    utterance.voice =
      voices.find(
        (voice) => voice.name === "Microsoft Zira - English (United States)"
      ) || voices[0];
    speechSynthesis.speak(utterance);
  }
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
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
  console.log("Speaking.....");
}
