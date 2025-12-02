import { NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

export class CheckToken implements NestMiddleware {
  use(req: Request, res: any, next: (error?: any) => void) {
    if (req.headers) {
      console.log('Hello request');
    }
    next();
  }
}
