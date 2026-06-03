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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmailsService = class EmailsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(dto) {
        const { status, priority, category, page = 1, limit = 20 } = dto;
        const where = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(category && { category }),
        };
        const [data, total] = await Promise.all([
            this.prisma.email.findMany({
                where,
                orderBy: { receivedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                omit: { bodyHtml: true, sentReply: true },
            }),
            this.prisma.email.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id) {
        const email = await this.prisma.email.findUnique({
            where: { id },
            include: { messages: { orderBy: { sentAt: 'asc' } } },
        });
        if (!email)
            throw new common_1.NotFoundException(`Email ${id} not found`);
        return email;
    }
    async create(data) {
        return this.prisma.email.create({ data });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.email.update({
            where: { id },
            data: dto,
        });
    }
    async countPending() {
        return this.prisma.email.count({ where: { status: 'PENDING' } });
    }
    async existsByGmailId(gmailId) {
        const count = await this.prisma.email.count({ where: { gmailId } });
        return count > 0;
    }
    async bulkDelete(ids) {
        const result = await this.prisma.email.deleteMany({
            where: { id: { in: ids } },
        });
        return { deleted: result.count };
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailsService);
//# sourceMappingURL=emails.service.js.map