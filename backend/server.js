
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.send("Backend is working! 🚀");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const result = await ai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
        ...history.slice(-10),
        { role: "user", content: message },
      ],
    });

    const reply = result.choices[0].message.content;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        user_message: message,
        bot_reply: reply,
      });

    if (error) throw error;

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      error: "Chat failed. Check the backend terminal.",
    });
  }
});

app.get("/api/history", async (req, res) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("user_message, bot_reply, created_at")
    .order("created_at", { ascending: true })
    .limit(50);
    console.log("History data:", data);
console.log("History error:", error);

  if (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Could not load chat history" });
  }

  res.json(data);
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});