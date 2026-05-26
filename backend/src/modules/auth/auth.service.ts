import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface GoogleTokenInfo {
  sub?: string;
  user_id?: string;
  email?: string;
  aud?: string;
  azp?: string;
  error?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async exchangeGoogleToken(googleAccessToken: string): Promise<{ token: string }> {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${googleAccessToken}`,
    );
    const info = (await res.json()) as GoogleTokenInfo;

    const userId = info.sub ?? info.user_id;

    if (info.error || !info.email || !userId) {
      this.logger.warn(`Google token invalid: ${info.error ?? 'missing email or sub'}`);
      throw new UnauthorizedException('Invalid Google access token');
    }

    const expectedClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const audience = info.aud ?? info.azp;
    if (expectedClientId && audience !== expectedClientId) {
      this.logger.warn(`Token audience mismatch — got: ${audience}, expected: ${expectedClientId}`);
      throw new UnauthorizedException('Token audience mismatch');
    }

    const token = this.jwtService.sign(
      { sub: userId, email: info.email },
      { expiresIn: '24h' },
    );

    return { token };
  }
}
