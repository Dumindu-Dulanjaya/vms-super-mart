import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Use X-Forwarded-For for proxied requests, fall back to IP
    return req.ips?.length > 0
      ? req.ips[0]
      : req.ip || req.connection.remoteAddress;
  }
}
