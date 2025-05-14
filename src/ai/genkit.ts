
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY;

// Log to the server console (where `next dev` is running)
console.log(
  '[Genkit Init] Attempting to initialize Google AI plugin.'
);
if (!apiKey) {
  console.error(
    '[Genkit Init] CRITICAL ERROR: GEMINI_API_KEY is MISSING or EMPTY in the environment.' +
    ' Please ensure it is correctly set in your .env file at the root of your project,' +
    ' and that the Next.js server has been restarted after changes to .env.'
  );
} else {
  console.log(
    '[Genkit Init] GEMINI_API_KEY found. Proceeding with Google AI plugin initialization.'
  );
}

export const ai = genkit({
  plugins: [
    // Pass the apiKey variable to the plugin.
    // If apiKey is undefined here, the googleAI plugin might not initialize correctly.
    googleAI({ apiKey }),
  ],
  // Consider adding logLevel for more detailed Genkit operational logs if issues persist beyond API key problems.
  // Note: logLevel configuration might vary with Genkit versions. For v1.x, this is often set per-plugin or globally.
  // For example, you might need to configure logging through a dedicated telemetry plugin or specific environment variables.
});

// Test log to ensure this module is run
console.log('[Genkit Init] Genkit ai object configured.');
