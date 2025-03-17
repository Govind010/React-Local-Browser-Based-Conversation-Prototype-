import { GoogleGenerativeAI } from "@google/generative-ai";
import { textToSpeech } from "./textToSpeech";
export async function apiResponse(
  transcript,
  messages,
  setMessages,
  setIsLoading,
  setListening,
  setIsConversation
) {
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
    const prompt = `Respond to this message in a natural, conversational, and engaging way, as if you were a real human. Use casual language, contractions, and natural pauses. 
    Make sure your response sounds friendly, expressive, and engaging. Don't be overly formal or robotic. 

    Message: "${transcript}" 

    Your response should feel authentic, like a real conversation. and give only text response`;

    let result = await chat.sendMessage(prompt);
    const aiText = result.response.text();
    textToSpeech(
      aiText,
      messages,
      setMessages,
      setIsLoading,
      setListening,
      setIsConversation
    );
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
