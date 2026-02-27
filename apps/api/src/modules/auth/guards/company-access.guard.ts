import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const companyId = req.params.companyId ?? req.query.companyId;

    if (!companyId || user.role === 'ADMIN') return true;

    const access = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    });

    if (!access) {
      throw new ForbiddenException('Acesso negado a esta empresa.');
    }

    return true;
  }
}
