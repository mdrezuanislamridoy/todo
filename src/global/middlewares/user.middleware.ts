import { NestMiddleware } from '@nestjs/common';

export class UserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    return console.log('Hello world');
    next();
  }
}
