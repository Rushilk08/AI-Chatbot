
const form = document.querySelector(".chat-input");
const input = document.querySelector(".chat-input input");
const messages = document.querySelector(".chat-messages");

const history = [];

function addMessage(text, className) {
  const message = document.createElement("div");
  message.classList.add("message", className);
  message.textContent = text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();

  if (!userMessage) return;

  // Display the user's message.
  addMessage(userMessage, "user-message");
  input.value = "";
  input.disabled = true;

  try {
    // Send the message to the backend.
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        history: history.slice(-10),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    // Display the AI's reply.
    addMessage(data.reply, "bot-message");

    // Save the conversation for context.
    history.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: data.reply }
    );
  } catch (error) {
    console.error("Chat error:", error);

    addMessage(
      "Unable to get an AI response. Check the server terminal.",
      "bot-message"
    );
  } finally {
    input.disabled = false;
    input.focus();
  }
  
async function loadHistory() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/history"
    );

    if (!response.ok) throw new Error("History load failed");

    const chats = await response.json();

    chats.forEach((chat) => {
      addMessage(chat.user_message, "user-message");
      addMessage(chat.bot_reply, "bot-message");

      history.push(
        { role: "user", content: chat.user_message },
        { role: "assistant", content: chat.bot_reply }
      );
    });
  } catch (error) {
    console.error("History error:", error);
  }
}

loadHistory();

});
fetch("http://localhost:5000/")
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));