const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversationHistory = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Simpan ke riwayat
  conversationHistory.push({ role: "user", text: userMessage });

  // Tambahkan indikator loading
  const loadingId = "loading-" + Date.now();
  appendMessage(
    "bot",
    "⚡ Mengakses basis data hukum... [DEKRIPSI]",
    loadingId,
  );

  // Kirim ke Backend
  // Gunakan IP server jika hostname tidak terdeteksi (misal saat buka file html langsung)
  const serverIP = "192.168.90.212"; // Sesuaikan dengan IP server Anda saat ini
  const apiBase = window.location.hostname
    ? `http://${window.location.hostname}:3000`
    : `http://${serverIP}:3000`;

  fetch(`${apiBase}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation: conversationHistory }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Server error");
      }
      return res.json();
    })
    .then((data) => {
      // Hapus indikator loading
      document.getElementById(loadingId)?.remove();

      const botResponse = data.result;
      appendMessage("bot", botResponse);
      // Simpan balasan model ke riwayat agar ada konteks percakapan
      conversationHistory.push({ role: "model", text: botResponse });
    })
    .catch((err) => {
      document.getElementById(loadingId)?.remove();

      // Popup Error API sesuai permintaan
      console.error("Connection Error:", err);
      alert(
        "⚠️ KONEKSI GAGAL\n\nMaaf, sistem sedang mengalami kendala teknis saat menghubungi server AI. Silakan coba beberapa saat lagi.\n\nDetail: " +
          err.message,
      );
    });
});

function appendMessage(sender, text, id = null) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  if (id) msg.id = id;

  // Render Markdown untuk bot, plain text untuk user & loading
  if (sender === "bot" && !id) {
    // Menggunakan library marked yang sudah di-import di index.html
    msg.innerHTML = marked.parse(text);
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
