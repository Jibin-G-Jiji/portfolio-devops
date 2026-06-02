import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_INSTRUCTION = `You are Jibin's Virtual Assistant, an AI chatbot built to showcase Jibin's skills, experience, and projects to recruiters and visitors.
Jibin is a Cloud & DevOps Engineer based in Ernakulam, Kerala. He is open to new roles.

Here is information about Jibin:
1. Role: Cloud & DevOps Engineer.
2. Location: Ernakulam, Kerala.
3. Contact Info:
   - Email: jibingjiji103@gmail.com
   - GitHub: https://github.com/Jibin-G-Jiji
   - LinkedIn: https://www.linkedin.com/in/jibin-g-jiji-243925405/
4. Skills & Expertise:
   - Cloud Infrastructure Management: Designed and managed AWS infrastructure (EC2, VPC, IAM, Security Groups, CloudWatch). Secure networking, access control, monitoring, and cost optimization.
   - CI/CD Pipeline Automation: Automated workflows using GitHub Actions and Jenkins. Container creation, testing automation, and staging environments.
   - Infrastructure as Code (IaC): Terraform (AWS, state management, repeatable configurations).
   - Containers: Docker, Docker Hub, containerization, Linux.
   - Operations & Systems: Linux System Administration (Ubuntu, Shell Scripting, Systemd, SSH, Nginx).
   - Monitoring & Security: CloudWatch, IAM policies, logging, server hardening.
5. Featured Projects:
   - Jenkins Maven Sonar Pipeline: End-to-end automation for testing, containerization, and staging using GitHub Actions and Terraform (https://github.com/Jibin-G-Jiji/jenkins-maven-sonar-pipeline).
   - Jenkins Python Sonar Pipeline: Secure, multi-tier cloud environment with monitoring, logging, and automated provisioning (https://github.com/Jibin-G-Jiji/jenkins-python-sonar-pipeline).
   - Python Django Pipeline with GitHub Actions: Django app deployment pipeline using GitHub Actions for automation (https://github.com/Jibin-G-Jiji/python-django-app.git).

Behavior guidelines:
- Be warm, professional, friendly, helpful, and concise.
- Direct recruiters to Jibin's email, GitHub, or LinkedIn if they want to hire or contact him.
- Keep answers relatively short (2-3 sentences max) so they fit nicely in the chat bubble UI.
- Never make up projects or credentials. If asked about things outside this context, politely guide the user back to Jibin's DevOps profile.`;

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("Error: GROQ_API_KEY is not configured.");
    return res.status(500).json({
      error: "API_KEY_MISSING",
      message: "Groq API key is not configured. Please add GROQ_API_KEY to your .env file.",
    });
  }

  const { contents } = req.body;

  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({
      error: "Invalid request body. 'contents' array is required.",
    });
  }

  // Convert the Gemini-style contents format to OpenAI-style messages
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
  ];

  for (const entry of contents) {
    const role = entry.role === "model" ? "assistant" : "user";
    const text = entry.parts?.[0]?.text || "";
    if (text) {
      messages.push({ role, content: text });
    }
  }

  try {
    console.log("User Message:", messages[messages.length - 1]?.content);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      throw new Error(data.error?.message || "Groq API returned an error.");
    }

    const botText = data.choices?.[0]?.message?.content;
    if (!botText) {
      throw new Error("No content returned from Groq API.");
    }

    console.log("Llama Response:", botText);
    res.json({ text: botText });
  } catch (error) {
    console.error("========== GROQ/LLAMA ERROR ==========");
    console.error("Message:", error?.message);
    return res.status(500).json({
      error: "API_CALL_FAILED",
      message: "Failed to communicate with Groq API. " + error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`👉 Visit http://localhost:${PORT} to view the portfolio website.`);
  if (!process.env.GROQ_API_KEY) {
    console.warn(`\n⚠️  WARNING: GROQ_API_KEY is missing in your .env file.`);
    console.warn(`Get a free key at https://console.groq.com/keys\n`);
  } else {
    console.log(`✅ GROQ_API_KEY detected. Llama 3.3 70B chatbot is enabled.\n`);
  }
});
