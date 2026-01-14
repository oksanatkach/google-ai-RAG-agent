
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { acmeApi } from "./acmeApi";
import { SYSTEM_INSTRUCTION, DEFAULT_MODEL } from "../constants";
import { Turn, Role, ToolInvocation } from "../types";

const getTableDeclaration: FunctionDeclaration = {
  name: 'getTable',
  description: 'Retrieves a list of all available ACME documents with their IDs and titles.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getOutlineDeclaration: FunctionDeclaration = {
  name: 'getOutline',
  description: 'Retrieves the outline (list of headings) for a specific document ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'The unique ID of the document (e.g., "company-overview")',
      },
    },
    required: ['id'],
  },
};

const getFullDeclaration: FunctionDeclaration = {
  name: 'getFull',
  description: 'Retrieves the full markdown content of a specific document ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'The unique ID of the document.',
      },
    },
    required: ['id'],
  },
};

export class GeminiAgent {
  private ai: GoogleGenAI;
  private chatHistory: any[] = [];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processUserQuery(
    content: string, 
    onProgress: (turn: Partial<Turn>) => void
  ): Promise<Turn> {
    const turnId = Math.floor(Date.now() / 1000);
    const startTimestamp = new Date().toISOString();
    // Track the actual start of performance measurement for duration tracking
    const startPerformance = performance.now();
    
    const turn: Turn = {
      turn_id: turnId,
      timestamp: startTimestamp,
      type: 'user_query',
      user_message: {
        role: Role.USER,
        content,
        timestamp: startTimestamp,
      },
      tool_invocations: [],
    };

    onProgress(turn);

    try {
      let toolInvocations: ToolInvocation[] = [];
      let stopLoop = false;
      let iteration = 0;
      const MAX_ITERATIONS = 10;

      // Maintain a fresh conversation state for Gemini
      const contents = [
        ...this.chatHistory,
        { role: Role.USER, parts: [{ text: content }] }
      ];

      while (!stopLoop && iteration < MAX_ITERATIONS) {
        iteration++;
        
        const response = await this.ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ 
              functionDeclarations: [
                getTableDeclaration, 
                getOutlineDeclaration, 
                getFullDeclaration
              ] 
            }],
          },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) break;

        const firstCandidate = candidates[0];
        const parts = firstCandidate.content.parts;
        const functionCalls = parts.filter(p => p.functionCall);

        if (functionCalls.length > 0) {
          const toolResponses: any[] = [];
          
          for (const fc of functionCalls) {
            const call = fc.functionCall!;
            const invocationId = `tool-inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const invokedAt = new Date().toISOString();
            const start = performance.now();
            
            let result: any;
            let status: 'success' | 'error' = 'success';

            try {
              if (call.name === 'getTable') {
                const tableData = await acmeApi.getTable();
                result = { documents: tableData };
              } else if (call.name === 'getOutline') {
                const outline = await acmeApi.getOutline(call.args.id as string);
                result = { outline: outline };  // Wrap string in object
              } else if (call.name === 'getFull') {
                const content = await acmeApi.getFull(call.args.id as string);
                result = { content: content };  // Wrap string in object
              }
            } catch (err: any) {
              status = 'error';
              result = { error: err.message };
            }

            const duration = Math.round(performance.now() - start);
            const completedAt = new Date().toISOString();

            const invocation: ToolInvocation = {
              invocation_id: invocationId,
              sequence: toolInvocations.length + 1,
              tool_name: call.name,
              arguments: call.args,
              invoked_at: invokedAt,
              completed_at: completedAt,
              duration_ms: duration,
              status,
              result,
            };

            toolInvocations.push(invocation);
            turn.tool_invocations = [...toolInvocations];
            onProgress({ ...turn });

            // toolResponses.push({
            //   functionResponse: {
            //     name: call.name,
            //     response: result
            //   }
            // });

          toolResponses.push({
            functionResponse: {
              name: call.name,
              response: result  // Just the raw result, not wrapped
            }
          });
          }

          console.log('Tool responses being sent:', JSON.stringify(toolResponses, null, 2));
          // Append function call and response parts to context
          contents.push(firstCandidate.content);
          // Fixed: Function responses must be associated with the Role.USER in the contents array
          // contents.push({ role: Role.USER, parts: toolResponses });
          contents.push({ 
              role: 'user',  // Use string literal instead of Role.USER
              parts: toolResponses 
            });

        } else {
          // No more tool calls, we have the final answer
          const finalResponse = response.text || "";
          const completedAt = new Date().toISOString();

          turn.model_response = {
            role: Role.MODEL,
            content: finalResponse,
            timestamp: completedAt,
            metadata: {
                confidence: 'high',
                reasoning: 'Synthesized from document tools'
            }
          };

          turn.turn_metadata = {
            // Fixed: Use startPerformance to calculate total turn duration
            total_duration_ms: Math.round(performance.now() - startPerformance),
            tool_call_count: toolInvocations.length,
            token_usage: {
              prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
              completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
              total_tokens: response.usageMetadata?.totalTokenCount || 0,
            }
          };

          this.chatHistory.push({ role: Role.USER, parts: [{ text: content }] });
          this.chatHistory.push({ role: Role.MODEL, parts: [{ text: finalResponse }] });

          stopLoop = true;
          onProgress({ ...turn });
        }
      }

      return turn;

    } catch (error: any) {
    console.error("Gemini processing error:", error);
    const errorTurn: Turn = {
      ...turn,
      model_response: {
        role: Role.MODEL,
        content: `Error: ${JSON.stringify(error, null, 2)}. Please try again.`,  // Show full error
        timestamp: new Date().toISOString(),
      }
    };
    onProgress(errorTurn);
    return errorTurn;
  }
  }
}
