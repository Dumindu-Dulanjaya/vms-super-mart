import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { IsString, MinLength } from 'class-validator';

class ChatMessageDto {
  @IsString()
  @MinLength(1)
  message!: string;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async handleMessage(@Body() payload: ChatMessageDto) {
    if (!payload.message) {
      throw new BadRequestException('Message string is required');
    }
    const reply = await this.chatbotService.generateResponse(payload.message);
    return { reply };
  }
}
