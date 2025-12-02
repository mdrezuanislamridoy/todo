import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/createTodo.dto';
import { JwtAuthGuard } from 'src/user/guards/jwt.auth';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createTodo(@Body() data: CreateTodoDto, @Req() req) {
    return this.todoService.createTodo(data, req);
  }
  @Get()
  getPosts() {
    console.log('Fetching posts');
  }
}
