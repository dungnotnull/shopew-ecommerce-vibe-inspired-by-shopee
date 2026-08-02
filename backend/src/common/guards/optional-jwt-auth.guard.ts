import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    // If there is an error or no user, we just return null/undefined instead of throwing
    // This allows the route to be accessed without authentication, but populates req.user if token is valid
    return user || null;
  }
}
