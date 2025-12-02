import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/createTodo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}
  async createTodo(todoData: CreateTodoDto, req) {
    const userId = req.user.id;

    const todo = await this.prisma.todo.create({
      data: {
        ...todoData,
        createdBy: userId,
      },
    });

    return {
      todo,
      message: 'Todo created successfully',
    };
  }
}
