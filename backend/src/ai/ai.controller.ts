import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { QueryDto } from './dto/query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('query')
  @ApiOperation({ summary: 'Ask the AI Assistant a question' })
  @ApiResponse({ status: 200, description: 'AI Response' })
  query(@Body() queryDto: QueryDto) {
    return this.aiService.processQuery(queryDto);
  }

  @Get('summary/:projectId')
  @ApiOperation({ summary: 'Get AI-generated project summary' })
  getSummary(@Param('projectId') projectId: string) {
    return this.aiService.processQuery({
      message: 'Please provide a comprehensive summary of this project.',
      projectId,
    });
  }
}
