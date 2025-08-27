// src/auth/auth.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Role } from '../enums/role.enum';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(public readonly allowedRoles: Role[]) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = req['user']; // Set earlier by AuthGuard

    if (!user) {
      throw new ForbiddenException('Access denied. No user found.');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${this.allowedRoles.join(', ')}`,
      );
    }

    next();
  }
}
