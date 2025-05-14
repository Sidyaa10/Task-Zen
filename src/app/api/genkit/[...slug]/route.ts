// src/app/api/genkit/[...slug]/route.ts
import { genkitNextHandler } from '@genkit-ai/next';
import '@/ai/dev'; // Ensure your flows are imported

export const { GET, POST } = genkitNextHandler();
