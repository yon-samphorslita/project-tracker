// src/auth/auth.middleware.factory.ts
import { Role } from '../enums/role.enum';
import { AuthMiddleware } from './auth.middleware';

export function authMiddlewareFactory(roles: Role[]) {
  // Return a FUNCTION middleware
  return (req, res, next) => {
    const middleware = new AuthMiddleware(roles);
    middleware.use(req, res, next);
  };
}
