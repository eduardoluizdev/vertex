import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma.service';
import { IntegrationsService, GITHUB_OAUTH_PROVIDER } from '../integrations/integrations.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      githubId: user.githubId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        githubId: user.githubId,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);

    // Por segurança, sempre retornamos a mesma resposta
    // independente de o usuário existir ou não
    if (!user) {
      return {
        message:
          'Se este email estiver cadastrado, você receberá as instruções em breve.',
      };
    }

    // Invalidar tokens anteriores não utilizados
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: { used: true },
    });

    // Gerar token seguro (64 bytes hex = 128 chars)
    const rawToken = crypto.randomBytes(64).toString('hex');

    // Token expira em 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        token: rawToken,
        expiresAt,
        userId: user.id,
      },
    });

    // Enviar email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.name,
      rawToken,
    );

    return {
      message:
        'Se este email estiver cadastrado, você receberá as instruções em breve.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido ou inexistente.');
    }

    if (resetToken.used) {
      throw new BadRequestException('Este token já foi utilizado.');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException(
        'Token expirado. Solicite uma nova redefinição de senha.',
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha e marcar token como usado em uma transação
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso. Você já pode fazer login.' };
  }

  async validateResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
      return { valid: false };
    }

    return { valid: true };
  }

  async githubLogin(code: string, linkUserId?: string) {
    // 1. Obter client_id e client_secret globais (raw, sem mascaramento)
    const githubConfig = await this.integrationsService.getGithubOauthRawConfig();

    if (!githubConfig?.clientId || !githubConfig?.clientSecret) {
      throw new BadRequestException('GitHub Login não está configurado.');
    }

    const { clientId, clientSecret } = githubConfig;

    // 2. Trocar código por access_token do GitHub (usando fetch nativo)
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new BadRequestException('Erro ao autenticar com o GitHub');
    }

    const tokenData = await tokenResponse.json();
    const githubAccessToken = tokenData.access_token;

    if (!githubAccessToken) {
      throw new BadRequestException('Código GitHub inválido ou expirado.');
    }

    // 3. Obter perfil do usuário logado via GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new BadRequestException('Erro ao obter perfil do GitHub');
    }

    const githubUser = await userResponse.json();
    const githubId = String(githubUser.id);
    let email = githubUser.email;

    // ... (rest of email fetching logic remains same)
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary && e.verified);
        if (primaryEmail) {
          email = primaryEmail.email;
        } else if (emails.length > 0) {
           email = emails[0].email;
        }
      }
    }

    if (!email) {
      throw new BadRequestException('Não foi possível obter um email da conta GitHub.');
    }

    // Caso seja uma solicitação de VÍNCULO (usuário já logado)
    if (linkUserId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: linkUserId },
      });

      if (!existingUser) {
        throw new BadRequestException('Usuário não encontrado para vínculo.');
      }

      // Verifica se esse GitHub já está vinculado a OUTRA conta
      const userWithThisGithub = await this.prisma.user.findUnique({
        where: { githubId },
      });

      if (userWithThisGithub && userWithThisGithub.id !== linkUserId) {
        throw new BadRequestException('Esta conta GitHub já está vinculada a outro usuário.');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: linkUserId },
        data: {
          githubId: githubId,
          avatar: existingUser.avatar || githubUser.avatar_url,
        },
      });

      if (!updatedUser.githubId) {
        throw new BadRequestException('Erro técnico: O ID do GitHub não pôde ser salvo.');
      }

      return this.generateToken(updatedUser);
    }

    // FLUXO DE LOGIN/CADASTRO NORMAL
    // 1. Tenta buscar pelo githubId primeiro (vínculo forte)
    let user = await this.prisma.user.findUnique({
      where: { githubId },
    });

    // 2. Se não achou por ID, tenta por email (vínculo automático por email)
    if (!user) {
      user = await this.usersService.findByEmail(email);
      
      // Se achou por email, vamos "carimbar" o githubId nele para facilitar futuros logins
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { githubId }
        });
      }
    }

    if (!user) {
      // Cria o usuário
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login,
          email: email,
          password: hashedPassword,
          avatar: githubUser.avatar_url,
          githubId,
          role: 'USER',
        }
      });
    } else if (!user.avatar && githubUser.avatar_url) {
       // Atualiza a foto se não tiver
       user = await this.prisma.user.update({
         where: { id: user.id },
         data: { avatar: githubUser.avatar_url }
       })
    }

    return this.generateToken(user);
  }
}
