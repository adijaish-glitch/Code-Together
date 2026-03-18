import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
});

router.post("/ai-chat", async (req, res) => {
  const {
    message,
    code,
    language,
    history,
  }: {
    message: string;
    code?: string;
    language?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  } = req.body;

  const lang = language || "JavaScript";

  const systemPrompt = [
    `You are an expert coding assistant embedded in 2gether Programming, a real-time pair programming platform.`,
    `Help the user understand, debug, and improve their code.`,
    `Current language: ${lang}.`,
    code ? `Current code:\n\`\`\`${lang.toLowerCase()}\n${code}\n\`\`\`` : "",
    `Be concise and practical. Format code snippets with markdown code blocks.`,
  ]
    .filter(Boolean)
    .join(" ");

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...(history || []),
    { role: "user", content: message },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2048,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
