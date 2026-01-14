
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ToolInvocation {
  invocation_id: string;
  sequence: number;
  tool_name: string;
  arguments: any;
  invoked_at: string;
  completed_at: string;
  duration_ms: number;
  status: 'success' | 'error';
  result: any;
}

export interface MessageMetadata {
  reasoning?: string;
  confidence?: 'high' | 'medium' | 'low';
  sources_cited?: string[];
}

export interface Turn {
  turn_id: number;
  timestamp: string;
  type: 'system' | 'user_query';
  user_message?: {
    role: Role.USER;
    content: string;
    timestamp: string;
  };
  tool_invocations?: ToolInvocation[];
  model_response?: {
    role: Role.MODEL;
    content: string;
    timestamp: string;
    metadata?: MessageMetadata;
  };
  // Simplified for system messages
  message?: {
    role: Role.MODEL;
    content: string;
  };
  turn_metadata?: {
    total_duration_ms: number;
    tool_call_count: number;
    token_usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface ConversationExport {
  conversation_id: string;
  created_at: string;
  updated_at: string;
  metadata: {
    agent_version: string;
    model: string;
    total_turns: number;
    total_tool_calls: number;
  };
  turns: Turn[];
  conversation_metadata: {
    total_duration_ms: number;
    total_tokens: number;
    user_messages: number;
    model_responses: number;
    tool_invocations: number;
    errors: string[];
  };
}

export interface AcmeDoc {
  id: string;
  title: string;
  path: string;
  last_updated: string;
  size_kb: number;
  outline?: string[];
  content?: string;
}
