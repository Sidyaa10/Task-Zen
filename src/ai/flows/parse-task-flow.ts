
'use server';
/**
 * @fileOverview A Genkit flow to parse natural language input into structured task data.
 *
 * - parseTaskFromNaturalLanguage - A function to process natural language and extract task details.
 * - ParseTaskInput - The input type for the internal flow (includes currentDate).
 * - ParsedTaskOutput - The structured task data returned by the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Internal schema used by the prompt and flow, including currentDate
const ParseTaskFlowInputSchema = z.object({
  naturalLanguageInput: z.string().describe("The user's natural language description of the task."),
  currentDate: z.string().describe("The current date in ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ) to help resolve relative dates."),
});
export type ParseTaskFlowInput = z.infer<typeof ParseTaskFlowInputSchema>;

const ParsedTaskOutputSchema = z.object({
  title: z.string().optional().describe('The main title or name of the task.'),
  description: z.string().optional().describe('A more detailed description of the task.'),
  dueDate: z.string().optional().describe("The due date for the task, formatted as 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm' if time is specified. If only a relative term like 'tomorrow' is provided and cannot be resolved to a specific date by the LLM, return the relative term."),
  assignee: z.string().optional().describe('The person or team assigned to the task, if mentioned.'),
  project: z.string().optional().describe('The project this task belongs to, if mentioned.'),
  tags: z.array(z.string()).optional().describe('Any tags or labels for the task, if mentioned (e.g., ["design", "urgent"]).'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('The priority of the task, if mentioned (high, medium, or low).'),
}).describe('Structured information extracted from a natural language task description.');
export type ParsedTaskOutput = z.infer<typeof ParsedTaskOutputSchema>;


// Exported wrapper function that client components will call
export async function parseTaskFromNaturalLanguage(naturalLanguageInput: string): Promise<ParsedTaskOutput> {
  const currentDate = new Date().toISOString();
  // Call the Genkit flow, ensuring the output matches ParsedTaskOutput
  // If parseTaskFlow throws an error, it will be propagated to the caller.
  const result = await parseTaskFlow({ naturalLanguageInput, currentDate });
  return result;
}

const taskParserPrompt = ai.definePrompt({
  name: 'taskParserPrompt',
  input: { schema: ParseTaskFlowInputSchema },
  output: { schema: ParsedTaskOutputSchema },
  prompt: `You are an expert task parsing assistant. Your goal is to extract structured information from a natural language description of a task.
The current date is {{currentDate}}. Use this to resolve relative dates (e.g., "tomorrow", "next Monday at 3pm").

From the user's input: "{{{naturalLanguageInput}}}"

Extract the following details:
- title: A concise title for the task. This should be mandatory. If no clear title, try to infer one.
- description: A more detailed description if provided.
- dueDate: The deadline for the task. If a relative date/time is mentioned (e.g., "next Friday at 2pm", "EOD tomorrow"), convert it to 'YYYY-MM-DD HH:mm' format if possible. If only a date is mentioned, use 'YYYY-DD-MM'. If no specific time, you can omit time or use a sensible default like end of day if implied (e.g., EOD). If no date is mentioned, or if you cannot resolve a relative date, omit this field or return the relative term.
- assignee: The name of the person or team assigned to the task.
- project: The project this task belongs to.
- tags: A list of relevant keywords or tags (e.g., ["meeting", "budget"]).
- priority: The priority of the task (must be one of: high, medium, low).

If a piece of information is not clearly present in the input, omit that field from your response. Ensure the 'title' field is always populated, even if inferred.
Provide the output in JSON format matching the defined schema.
`,
});

const parseTaskFlow = ai.defineFlow(
  {
    name: 'parseTaskFlow',
    inputSchema: ParseTaskFlowInputSchema,
    outputSchema: ParsedTaskOutputSchema,
  },
  async (input) => {
    const { output } = await taskParserPrompt(input);
    if (!output) {
        console.error("Task parsing prompt did not return an output. LLM response might be malformed or not adhere to schema.");
        // Throw an error to be caught by the calling function's try-catch block
        throw new Error("Failed to parse task from LLM response. The AI could not understand the input or structure the data correctly.");
    }
    // Ensure title is present, even if the schema allows it to be optional,
    // as per the prompt's instruction. If not, treat it as a partial failure.
    if (!output.title) {
        console.warn("Task parsing prompt returned output without a title, though title is expected to be mandatory by prompt.", output);
        // You could either throw an error here or try to supplement/fix.
        // For now, let's allow it if schema permits, but it's a point of attention.
        // If title becomes strictly mandatory in schema, Zod would handle this.
    }
    return output;
  }
);

