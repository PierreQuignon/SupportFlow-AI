import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ExchangeTokenDto } from './dto/exchange-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('token')
  exchangeToken(@Body() dto: ExchangeTokenDto) {
    return this.authService.exchangeGoogleToken(dto.googleAccessToken);
  }
}
