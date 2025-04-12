// src/ai/flows/message-suggestions.ts
'use server';

/**
 * @fileOverview Provides suggestions for improving an apology message.
 *
 * - getImprovementSuggestions - A function that generates suggestions for improving an apology message.
 * - ImprovementSuggestionsInput - The input type for the getImprovementSuggestions function.
 * - ImprovementSuggestionsOutput - The return type for the getImprovementSuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImprovementSuggestionsInputSchema = z.object({
  message: z.string().describe('The apology message to improve.'),
  context: z.string().describe('Additional context about the situation.'),
});
export type ImprovementSuggestionsInput = z.infer<
  typeof ImprovementSuggestionsInputSchema
>;

const ImprovementSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Suggestions for improving the apology message.'),
});
export type ImprovementSuggestionsOutput = z.infer<
  typeof ImprovementSuggestionsOutputSchema
>;

export async function getImprovementSuggestions(
  input: ImprovementSuggestionsInput
): Promise<ImprovementSuggestionsOutput> {
  return getImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvementSuggestionsPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The apology message to improve.'),
      context: z.string().describe('Additional context about the situation.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z
        .array(z.string())
        .describe('Suggestions for improving the apology message.'),
    }),
  },
  prompt: `You are an AI assistant that helps people improve their apology messages.  Given the message and the context, provide suggestions on how to improve the message.

Context: {{{context}}}

Message: {{{message}}}

Suggestions:`,
});

const getImprovementSuggestionsFlow = ai.defineFlow<
  typeof ImprovementSuggestionsInputSchema,
  typeof ImprovementSuggestionsOutputSchema
>(
  {
    name: 'getImprovementSuggestionsFlow',
    inputSchema: ImprovementSuggestionsInputSchema,
    outputSchema: ImprovementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
