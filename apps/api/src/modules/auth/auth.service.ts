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

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
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

  async githubLogin(code: string) {
    // 1. Obter client_id e client_secret globais
    const integrations = await this.integrationsService.getIntegrations();
    const githubConfig = integrations.githubOauth;

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
        client_secret: clientSecret, // O Integration service mascara isso apenas na resposta para o front, aqui acessaremos direto da Config real.
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

    let email = githubUser.email;

    // Ocasionalmente, usuários podem deixar o email privado no GitHub.
    // Nesses casos precisamos fazer outra requisição.
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

    // 4. Checar se usuário já existe
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Cria o usuário
      // Senha aleatória gigante só para preencher o campo required do DB, ele usará GitHub para logar
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login,
          email: email,
          password: hashedPassword,
          avatar: githubUser.avatar_url,
          role: 'USER', // Role padrão para quem se cadastra por redes sociais
        }
      });
    } else if (!user.avatar && githubUser.avatar_url) {
       // Atualiza a foto se não tiver
       user = await this.prisma.user.update({
         where: { id: user.id },
         data: { avatar: githubUser.avatar_url }
       })
    }

    // 5. Gerar e retornar JWT próprio
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }
}
