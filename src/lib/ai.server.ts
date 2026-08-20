import { streamText } from "ai";

import { getGatewayModel } from "./ai-gateway.server";

async function complete(system: string, prompt: string) {
  const result = streamText({
    model: getGatewayModel(),
    system,
    prompt,
  });
  return await result.text;
}

export async function runEmail(data: {
  purpose: string;
  recipient: string;
  tone: "Formal" | "Friendly" | "Persuasive";
  details: string;
}) {
  const text = await complete(
    `You are an expert career communication writer. Write concise, well-structured professional emails in markdown.
Tone: ${data.tone}. Always include a subject line as "**Subject:** ..." followed by the email body. Keep it under 220 words.`,
    `Purpose: ${data.purpose}
Recipient: ${data.recipient || "Hiring manager"}
Extra details/context: ${data.details || "none"}`,
  );
  return { text };
}

export async function runPlan(data: { goals: string; tasks: string; horizon: "daily" | "weekly" }) {
  const text = await complete(
    `You are a productivity planner for job seekers. Return ONLY a markdown list of tasks, one per line, in the form:
- [P1] Task title — 30m — Monday morning
Priority is P1 (highest) to P3. Include between 5 and 10 tasks, ordered from highest to lowest priority. No preamble, no extra prose.`,
    `Planning horizon: ${data.horizon}
Goals: ${data.goals}
Existing tasks to include: ${data.tasks || "none"}`,
  );
  return { text };
}

export async function runChat(messages: { role: "user" | "assistant"; content: string }[]) {
  const result = streamText({
    model: getGatewayModel(),
    system: `You are "JobTrack Assistant", a friendly expert on job searching, applications, interviews, resumes, and workplace productivity.
Answer in short, practical markdown with bullet points where useful. If asked about something outside those areas, briefly redirect to job search or productivity help.`,
    messages,
  });
  return { text: await result.text };
}
