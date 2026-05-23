import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // ThrottlerGuard expects a Promise<string> return type in newer versions
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use X-Forwarded-For for proxied requests, fall back to IP
    return req.ips?.length > 0
      ? req.ips[0]
      : req.ip || req.connection.remoteAddress;
  }
}
