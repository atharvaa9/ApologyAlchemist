// This file is machine-generated - DO NOT EDIT.

'use server';

/**
 * @fileOverview Adjusts the tone of an AI-generated apology message.
 *
 * - adjustApologyTone - A function that adjusts the tone of an apology message.
 * - AdjustApologyToneInput - The input type for the adjustApologyTone function.
 * - AdjustApologyToneOutput - The return type for the adjustApologyTone function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AdjustApologyToneInputSchema = z.object({
  message: z.string().describe('The AI-generated apology message.'),
  tone: z.string().describe('The desired tone of the apology message (e.g., serious, playful, sincere).'),
});
export type AdjustApologyToneInput = z.infer<typeof AdjustApologyToneInputSchema>;

const AdjustApologyToneOutputSchema = z.object({
  adjustedMessage: z.string().describe('The apology message with the adjusted tone.'),
});
export type AdjustApologyToneOutput = z.infer<typeof AdjustApologyToneOutputSchema>;

export async function adjustApologyTone(input: AdjustApologyToneInput): Promise<AdjustApologyToneOutput> {
  return adjustApologyToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustApologyTonePrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The AI-generated apology message.'),
      tone: z.string().describe('The desired tone of the apology message (e.g., serious, playful, sincere).'),
    }),
  },
  output: {
    schema: z.object({
      adjustedMessage: z.string().describe('The apology message with the adjusted tone.'),
    }),
  },
  prompt: `Please adjust the tone of the following apology message to be more {{{tone}}}.\n\nOriginal Message: {{{message}}}`,
});

const adjustApologyToneFlow = ai.defineFlow<
  typeof AdjustApologyToneInputSchema,
  typeof AdjustApologyToneOutputSchema
>(
  {
    name: 'adjustApologyToneFlow',
    inputSchema: AdjustApologyToneInputSchema,
    outputSchema: AdjustApologyToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
