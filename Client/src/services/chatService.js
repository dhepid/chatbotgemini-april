/**
 * Mengirim riwayat percakapan ke backend dan mendapatkan respon dari AI.
 * @param {Array} conversation - Array pesan [{ role: "user", text: "..." }, ...]
 * @returns {Promise<string>} - Hasil teks dari AI
 */
export const sendChatToBackend = async (conversation) => {
  const serverIP = "192.168.90.212";
  const apiBase =
    window.location.hostname && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:3000`
      : `http://${serverIP}:3000`;
  const API_URL = `${apiBase}/api/chat`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation: conversation,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghubungi server");
    }

    const data = await response.json();
    return data.result; // Properti 'result' sesuai dengan res.json({ result: response.text }) di backend
  } catch (error) {
    console.error("Chat Error:", error.message);
    throw error;
  }
};
