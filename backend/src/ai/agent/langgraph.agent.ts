import { StateGraph, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { getProjectSummaryTool } from '../tools/getProjectSummary.tool';
import { getOverdueTasksTool } from '../tools/getOverdueTasks.tool';
import { getTasksByStatusTool } from '../tools/getTasksByStatus.tool';
import { suggestNextActionsTool } from '../tools/suggestNextActions.tool';

const tools = [
  getProjectSummaryTool,
  getOverdueTasksTool,
  getTasksByStatusTool,
  suggestNextActionsTool,
];

// Define the state for the graph
export interface AgentState {
  messages: any[];
  context: string;
  toolsUsed: string[];
}

export function createAgent() {
  const llm = new ChatOpenAI({
    modelName: process.env.AI_MODEL_NAME || 'gpt-4o',
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: process.env.OPENAI_BASE_URL ? {
      baseURL: process.env.OPENAI_BASE_URL,
    } : undefined,
  }).bindTools(tools);

  const graphState = {
    messages: {
      value: (x: any[], y: any[]) => x.concat(y),
      default: () => [],
    },
    context: {
      value: (x: string, y: string) => y || x,
      default: () => '',
    },
    toolsUsed: {
      value: (x: string[], y: string[]) => x.concat(y),
      default: () => [],
    },
  };

  const classifyIntent = async (state: AgentState) => {
    const prompt = `
You are an intelligent project management assistant. You have access to real-time data about projects and tasks through your tools. 

When answering:
- Always be specific — reference actual task names, dates, and statuses from the data
- For overdue tasks, always mention how many days overdue
- For next actions, prioritize by urgency and impact
- Keep responses concise and actionable
- If you cannot find relevant data, say so clearly

Current context: ${state.context}
`;
    const messages = [new SystemMessage(prompt), ...state.messages];
    const response = await llm.invoke(messages);
    return { messages: [response] };
  };

  const shouldContinue = (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return 'executeTool';
    }
    return END;
  };

  const executeTool = async (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = lastMessage.tool_calls || [];
    const results = [];
    const toolsUsed = [];

    for (const toolCall of toolCalls) {
      const tool = tools.find((t) => t.name === toolCall.name);
      if (tool) {
        try {
          const result = await tool.invoke(toolCall.args);
          results.push(new ToolMessage({ tool_call_id: toolCall.id, content: result }));
          toolsUsed.push(tool.name);
        } catch (e: any) {
          results.push(new ToolMessage({ tool_call_id: toolCall.id, content: `Error: ${e.message}` }));
        }
      } else {
        results.push(new ToolMessage({ tool_call_id: toolCall.id, content: `Tool ${toolCall.name} not found.` }));
      }
    }

    return { messages: results, toolsUsed };
  };

  const handleError = async (state: AgentState, error: Error) => {
    return {
      messages: [new AIMessage("I'm sorry, I encountered an internal error while trying to process your request.")],
    };
  };

  const workflow = new StateGraph({ channels: graphState as any })
    .addNode('classifyIntent', classifyIntent)
    .addNode('executeTool', executeTool)
    .addEdge('executeTool', 'classifyIntent'); // Return to classifyIntent to analyze tool result

  workflow.setEntryPoint('classifyIntent');
  workflow.addConditionalEdges('classifyIntent', shouldContinue);

  return workflow.compile();
}
