import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { createAgent } from './agent/langgraph.agent';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class AiService {
  private agent: any;

  constructor() {
    this.agent = createAgent();
  }

  async processQuery(queryDto: QueryDto) {
    try {
      const { message, projectId } = queryDto;
      const context = projectId ? `Project ID: ${projectId}` : 'Global Context (no specific project)';

      const initialState = {
        messages: [new HumanMessage(message)],
        context,
        toolsUsed: [],
      };

      const finalState = await this.agent.invoke(initialState, {
        configurable: { thread_id: Date.now().toString() }, // simple mock thread_id
      });

      const lastMessage = finalState.messages[finalState.messages.length - 1];
      const toolsUsed = [...new Set(finalState.toolsUsed)]; // unique tools

      return {
        reply: lastMessage.content as string,
        toolsUsed,
        traceId: 'N/A', // LangSmith trace ID would require specific setup with run callbacks
      };
    } catch (error) {
      console.error('AI Error:', error);
      throw new InternalServerErrorException('Failed to process AI query');
    }
  }
}
