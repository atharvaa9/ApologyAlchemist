'use server';
/**
 * @fileOverview AI-powered apology message generator.
 *
 * - generateApology - A function that generates an apology message based on the provided context.
 * - GenerateApologyInput - The input type for the generateApology function.
 * - GenerateApologyOutput - The return type for the generateApology function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {sendMessage, Message} from '@/services/message-sender';

const GenerateApologyInputSchema = z.object({
  context: z.string().describe('Detailed context about what happened and why you are apologizing.'),
  recipient: z.string().describe('The recipient of the apology message (e.g., name or relationship).'),
  senderName: z.string().describe('The sender of the apology message.'),
  tone: z.string().optional().describe('The desired tone of the apology message (e.g., heartfelt, playful, sincere).'),
});
export type GenerateApologyInput = z.infer<typeof GenerateApologyInputSchema>;

const GenerateApologyOutputSchema = z.object({
  apologyMessage: z.string().describe('The generated apology message.'),
});
export type GenerateApologyOutput = z.infer<typeof GenerateApologyOutputSchema>;

export async function generateApology(input: GenerateApologyInput): Promise<GenerateApologyOutput> {
  return generateApologyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApologyPrompt',
  input: {
    schema: z.object({
      context: z.string().describe('Detailed context about what happened and why you are apologizing.'),
      recipient: z.string().describe('The recipient of the apology message (e.g., name or relationship).'),
      senderName: z.string().describe('The sender of the apology message.'),
      tone: z.string().optional().describe('The desired tone of the apology message (e.g., heartfelt, playful, sincere).'),
    }),
  },
  output: {
    schema: z.object({
      apologyMessage: z.string().describe('The generated apology message.'),
    }),
  },
  prompt: `You are an AI assistant designed to help people write heartfelt apology messages.  Your job is to take the context of the situation and write a message that conveys sincere remorse.

  Context: {{{context}}}
  Recipient: {{{recipient}}}
  Sender: {{{senderName}}}

  Tone: {{#if tone}}{{{tone}}}{{else}}Heartfelt{{/if}}

  Apology Message:`,
});

const generateApologyFlow = ai.defineFlow<
  typeof GenerateApologyInputSchema,
  typeof GenerateApologyOutputSchema
>({
  name: 'generateApologyFlow',
  inputSchema: GenerateApologyInputSchema,
  outputSchema: GenerateApologyOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});