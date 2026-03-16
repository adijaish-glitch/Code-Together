import { useMutation } from "@tanstack/react-query";

interface RunCodeResponse {
  output: string;
  error?: string;
}

export function useRunCode() {
  return useMutation({
    mutationFn: async (code: string): Promise<RunCodeResponse> => {
      try {
        const res = await fetch('/api/run-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        
        if (!res.ok) {
          // Attempt to parse error response
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || errData?.message || `Server error: ${res.status}`);
        }
        
        return await res.json();
      } catch (err) {
        // Fallback for when the API isn't implemented yet
        return {
          output: "",
          error: err instanceof Error ? err.message : "Failed to execute code. Ensure backend is running."
        };
      }
    }
  });
}
