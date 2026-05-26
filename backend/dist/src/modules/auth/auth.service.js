"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async exchangeGoogleToken(googleAccessToken) {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${googleAccessToken}`);
        const info = (await res.json());
        const userId = info.sub ?? info.user_id;
        if (info.error || !info.email || !userId) {
            this.logger.warn(`Google token invalid: ${info.error ?? 'missing email or sub'}`);
            throw new common_1.UnauthorizedException('Invalid Google access token');
        }
        const expectedClientId = this.configService.get('GOOGLE_CLIENT_ID');
        const audience = info.aud ?? info.azp;
        if (expectedClientId && audience !== expectedClientId) {
            this.logger.warn(`Token audience mismatch — got: ${audience}, expected: ${expectedClientId}`);
            throw new common_1.UnauthorizedException('Token audience mismatch');
        }
        const token = this.jwtService.sign({ sub: userId, email: info.email }, { expiresIn: '24h' });
        return { token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map