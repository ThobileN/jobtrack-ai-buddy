import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runEmail, runPlan, runChat } from "./ai.server";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().optional().default(""),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  details: z.string().optional().default(""),
});

const PlanInput = z.object({
  goals: z.string().min(1),
  tasks: z.string().optional().default(""),
  horizon: z.enum(["daily", "weekly"]),
});

const ChatInput = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => runEmail(data));

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => runPlan(data));

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => runChat(data.messages));
