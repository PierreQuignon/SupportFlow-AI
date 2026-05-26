import { AuthService } from './auth.service';
import { ExchangeTokenDto } from './dto/exchange-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    exchangeToken(dto: ExchangeTokenDto): Promise<{
        token: string;
    }>;
}
