# 🧩 ACME Q&A Agent Assignment

---

## Part 1: Agent and Tooling
> Goolge AI Studio (Typescript)

**Objective**
Create a minimal chat agent capable of answering questions about ACME company documents.

**Requirements**

1. **Chat Interface**

   * Build a simple web-based chat UI.
   * Should allow users to send and receive messages in a conversational format.
   * Display tool invocations in the chat UI as distinct message types

2. **Agent Orchestration**

   * Implement agent orchestration code inside **Google AI Studio**.
   * Use `gemini-2.5-flash` model via the built-in `@google/genai` SDK (no additional setup required).
   * The agent should be able to invoke available tools when needed.

3. **Tool Implementation**

   * Implement a small set of tools interacting with the ACME documentation API.
   * The production API is available at: **https://ds-acme-assignment.vercel.app**
   * For complete API documentation and endpoint details, visit: **https://ds-acme-assignment.vercel.app**
   * Design your tools to interact with the available knowledge base endpoints

4. **Conversation Export**

   * Each conversation should be exportable as a JSON file using a turn-based schema that correlates tool invocations with specific user queries:

     ```json
     {
       "conversation_id": "conv-1762090406150",
       "created_at": "2025-11-02T13:33:26.150Z",
       "updated_at": "2025-11-02T13:35:42.321Z",
       "metadata": {
         "agent_version": "1.0.0",
         "model": "gemini-1.5-pro",
         "total_turns": 2,
         "total_tool_calls": 3
       },
       "turns": [
         {
           "turn_id": 0,
           "timestamp": "2025-11-02T13:33:26.150Z",
           "type": "system",
           "message": {
             "role": "model",
             "content": "Hello! I'm a Gemini-powered agent..."
           }
         },
         {
           "turn_id": 1,
           "timestamp": "2025-11-02T13:35:10.234Z",
           "type": "user_query",
           "user_message": {
             "role": "user",
             "content": "when was acme founded?",
             "timestamp": "2025-11-02T13:35:10.234Z"
           },
           "tool_invocations": [
             {
               "invocation_id": "tool-inv-001",
               "sequence": 1,
               "tool_name": "getTable",
               "arguments": {},
               "invoked_at": "2025-11-02T13:35:10.456Z",
               "completed_at": "2025-11-02T13:35:10.678Z",
               "duration_ms": 222,
               "status": "success",
               "result": { "...": "..." }
             }
           ],
           "model_response": {
             "role": "model",
             "content": "ACME was founded in 1995.",
             "timestamp": "2025-11-02T13:35:12.000Z",
             "metadata": {
               "reasoning": "Found in company-overview.mdc",
               "confidence": "high",
               "sources_cited": ["company-overview.mdc"]
             }
           },
           "turn_metadata": {
             "total_duration_ms": 1766,
             "tool_call_count": 3,
             "token_usage": {
               "prompt_tokens": 1250,
               "completion_tokens": 12,
               "total_tokens": 1262
             }
           }
         }
       ],
       "conversation_metadata": {
         "total_duration_ms": 106076,
         "total_tokens": 1262,
         "user_messages": 1,
         "model_responses": 2,
         "tool_invocations": 3,
         "errors": []
       }
     }
     ```

5. **Acceptance Criteria**

   Your agent should handle these scenarios correctly. Test your system prompts and tool usage instructions to ensure proper behavior:

   **Scenario 1: Handling In-Scope Questions with No Answer**

   * **Test:** Ask "What is ACME's environmental sustainability policy?"
   * **Expected:** Agent acknowledges this is a valid ACME question but information isn't available in the documentation
   * **Example:** "I don't have information about ACME's environmental sustainability policy in the available documentation. This would be a good question for the HR or Operations team."
   * **Why it matters:** Distinguishes between out-of-scope questions and legitimate questions that just aren't documented yet

   **Scenario 2: Avoiding Redundant Tool Calls**

   * **Test:** Ask "What products does ACME offer?" then ask "Tell me more about the first one"
   * **Expected:** Agent uses information from the first query without calling `getTable` again
   * **Why it matters:** Reduces API calls and improves response time

   **Scenario 3: Efficient Tool Usage**

   * **Test:** Ask "What are ACME's security best practices?"
   * **Expected:** Agent follows a smart sequence:
     1. First, use `getTable` to see all available documents
     2. Then, use `getOutline` to preview relevant documents
     3. Finally, use `getFull` only on the most relevant document(s)
   * **Why it matters:** Prevents fetching unnecessary full documents


# !!!!!!!!!!!!!!!!!! BAD
   **Scenario 4: Ambiguous Query Requiring Disambiguation**

   * **Test:** Ask "Tell me about ACME's people"
   * **Expected:** Agent should recognize ambiguity and either:
     - Ask clarifying questions: "I can provide information about ACME's employee count, team structure, onboarding process, or company culture. Which would you like to know about?"
     - OR provide a comprehensive overview covering multiple aspects with clear sections
   * **Why it matters:** Tests whether agent can handle vague queries intelligently rather than making arbitrary choices

   **Scenario 5: Multi-Hop Reasoning Chain**

   * **Test:** Ask "If I'm having login issues with our most popular product, what should I try?"
   * **Expected:** Agent needs to:
     1. First identify "most popular product" (requires checking metrics → ACME Analytics with 5,000 users)
     2. Then search troubleshooting guide for authentication problems
     3. Then find support contact information
     4. Synthesize: "ACME Analytics is our most popular product. For login issues, try: [troubleshooting steps]. If problems persist, contact support@acme.com. (Sources: company-metrics.mdc, support/troubleshooting-guide.mdc)"
   * **Why it matters:** Tests multi-step reasoning where each step depends on the previous answer

---

## Part 2: Evaluation and Learning Pipeline
> 💻 Local (*.py script/Jupyter Notebook)

**Objective**
Create a pipeline that processes multiple conversation logs, extracts insights, and uses them to improve the agent.

**Requirements**

1. **Input Data**

   * Use multiple conversation JSON logs generated from Part 1.
   * Each log includes user messages, agent responses, and any tool invocations.

2. **Evaluation Process**

   * Analyze the conversation logs and extract insights such as common issues or opportunities for improvement.

3. **Insight Integration**

   * Modify or extend the system prompt based on extracted insights.
   * Example:

     ```text
     Before: You are an ACME company assistant.
     After: You are an ACME company assistant. Always include the document title when providing an answer.
     ```

4. **Automation**

   * Demonstrate a feedback process where insights lead to prompt updates and behavioral adjustments.

---

## Deliverables

**Part 1 Deliverables:**

1. **Google AI Studio Application**
   * Link to your Google AI Studio app
   * Verify the link has "anyone with the link" permission enabled
   * App should include the chat interface, agent orchestration, and tool implementations

2. **Exported Conversation JSON Files**
   * JSON exports for each of the 5 acceptance criteria scenarios:
     - `scenario-1-in-scope-no-answer.json`
     - `scenario-2-redundant-tool-calls.json`
     - `scenario-3-efficient-tool-usage.json`
     - `scenario-4-ambiguous-query.json`
     - `scenario-5-multi-hop-reasoning.json`

**Part 2 Deliverables:**

3. **Pipeline Script/Code**
   * Python script (`.py`) or Jupyter Notebook (`.ipynb`) containing the evaluation and learning pipeline

4. **Insights Output**
   * File showing the extracted insights from analyzing conversation logs
   * Can be JSON, text file, or included in notebook output

---

## Environment Setup

* **Platform:** Google AI Studio
* **LLM:** Gemini (via built-in SDK) — works out of the box, no configuration required
* **Production BASE URL API:** https://ds-acme-assignment.vercel.app
  * API documentation: https://ds-acme-assignment.vercel.app

---
