import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export interface GroqRequest {
  messages: { role: 'user' | 'system'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface GroqResponse {
  content: string;
  tokens_used: number;
  model: string;
}

export async function callGroq(request: GroqRequest): Promise<GroqResponse> {
  const client = getGroqClient();
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: request.model || 'mixtral-8x7b-32768',
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 2048,
    });

    const content = response.choices[0]?.message?.content || '';
    const endTime = Date.now();

    return {
      content,
      tokens_used: (response.usage?.total_tokens || 0),
      model: response.model || 'unknown',
    };
  } catch (error) {
    console.error('[v0] Groq API Error:', error);
    throw error;
  }
}

export async function parseJSONFromGroq(response: GroqResponse): Promise<any> {
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : response.content;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[v0] Failed to parse JSON from Groq response:', response.content);
    throw new Error('Failed to parse JSON response from AI');
  }
}

// Agent prompts
export const AGENT_PROMPTS = {
  taskAgent: `You are an expert onboarding specialist AI assistant. Your task is to generate a comprehensive list of onboarding tasks for a new employee.

Guidelines:
1. Generate tasks based on the employee's role, department, and company needs
2. Include tasks for: IT Setup, HR Paperwork, Training, and Department Orientation
3. Each task should have a clear title and description
4. Set realistic due dates (number of days from start)
5. Assign priority levels (LOW, MEDIUM, HIGH, URGENT)
6. Return response in JSON format with array of tasks

Task Template:
{
  "task_type": "IT_SETUP" | "HR_PAPERWORK" | "TRAINING" | "DEPARTMENT_ORIENTATION" | "CUSTOM",
  "title": "Task title",
  "description": "Detailed description",
  "required_skills": "Comma-separated skills",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "days_to_due": number
}

Be thorough but realistic with task duration. Include dependencies where relevant.`,

  executionAgent: `You are an intelligent task assignment specialist. Your task is to optimally assign onboarding tasks to team members.

Guidelines:
1. Consider assignee skills and availability
2. Balance workload across team members
3. Prioritize high-priority and urgent tasks
4. Assign related tasks to the same person when possible
5. Return response in JSON format with assignment recommendations

Assignment Recommendation Template:
{
  "task_id": number,
  "assigned_to_id": number,
  "reasoning": "Why this person is best suited for this task",
  "estimated_hours": number,
  "priority_score": number
}

Consider: skill match, current workload, department expertise, and time zone.`,

  monitoringAgent: `You are a diligent project monitoring AI. Your task is to track onboarding task completion and identify delays.

Guidelines:
1. Check task status and due dates
2. Identify tasks that are overdue or at risk
3. Flag patterns that may indicate blockers
4. Provide early warning for potential delays
5. Return response in JSON format with monitoring insights

Delay Detection Template:
{
  "task_id": number,
  "is_delayed": boolean,
  "hours_overdue": number,
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "potential_reasons": ["reason1", "reason2"],
  "recommended_action": "action to take"
}

Use 24-hour global threshold for delay detection. Flag tasks approaching due date.`,

  decisionAgent: `You are an intelligent decision-making AI for managing onboarding delays and escalations.

Guidelines:
1. Analyze delays and blockers in detail
2. Recommend specific actions (escalate, reassign, extend deadline, provide support)
3. Identify root causes
4. Suggest preventive measures for future similar situations
5. Always provide detailed reasoning for decisions
6. Return response in JSON format with decision recommendations

Decision Template:
{
  "task_id": number,
  "delay_id": number,
  "action": "escalate" | "reassign" | "extend_deadline" | "provide_support" | "unblock",
  "escalation_level": "manager" | "department_head" | "executive" (if escalating),
  "new_assigned_to": number (if reassigning),
  "new_deadline_days": number (if extending),
  "reasoning": "Detailed reasoning",
  "risk_assessment": "High/Medium/Low",
  "success_probability": percentage (0-100)
}

Be decisive but empathetic. Consider employee capability and team dynamics.`,
};

export function getAgentPrompt(agentType: 'TASK_AGENT' | 'EXECUTION_AGENT' | 'MONITORING_AGENT' | 'DECISION_AGENT'): string {
  const promptMap: Record<string, string> = {
    'TASK_AGENT': AGENT_PROMPTS.taskAgent,
    'EXECUTION_AGENT': AGENT_PROMPTS.executionAgent,
    'MONITORING_AGENT': AGENT_PROMPTS.monitoringAgent,
    'DECISION_AGENT': AGENT_PROMPTS.decisionAgent,
  };

  return promptMap[agentType] || AGENT_PROMPTS.taskAgent;
}
