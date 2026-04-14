import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
const port = 3000;
const model = "gemini-2.5-flash-lite";

const upload = multer();

if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in .env file");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1beta",
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Devid");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or empty conversation format" });
    }

    console.log(
      `[Chat] ${req.ip} is processing request with ${conversation.length} messages`,
    );

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const result = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: {
          parts: [
            {
              text: "You are an AI legal assistant specialized in Indonesia law. Your role is to provide accurate information using an academic yet smart-casual tone: clear, professional, but approachable and not intimidating. Avoid overly complex legal jargon; when necessary, explain terms simply. Do not provide definitive legal advice or replace a licensed lawyer. Include a brief disclaimer when appropriate. Ask clarifying questions if the user's situation is unclear. Structure answers logically.",
            },
          ],
        },
        temperature: 0.2,
      },
    });

    if (!result || !result.text) {
      throw new Error("AI returned an empty response");
    }

    res.status(200).json({ result: result.text.trim() });
  } catch (error) {
    const errorMessage = error.message || "Internal Server Error";
    console.error("Chat Error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.status(200).json({ result: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const base64image = req.file.buffer.toString("base64");
    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64image,
                mimeType: req.file.mimetype,
              },
            },
          ],
        },
      ],
    });

    res.status(200).json({ result: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!req.file) {
        return res.status(400).json({ error: "No document file uploaded" });
      }
      const base64document = req.file.buffer.toString("base64");
      const result = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64document,
                  mimeType: req.file.mimetype,
                },
              },
            ],
          },
        ],
      });
      res.status(200).json({ result: result.text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const base64Audio = req.file.buffer.toString("base64");
    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Audio,
                mimeType: req.file.mimetype,
              },
            },
          ],
        },
      ],
    });
    res.status(200).json({ result: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// const express = require('express') dirubah menjadi script dibawah
// The client gets the API key from the environment variable `GEMINI_API_KEY`.

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "Is our sun always moving in space?",
//   });
//   console.log(response.text);
// }

// main();
