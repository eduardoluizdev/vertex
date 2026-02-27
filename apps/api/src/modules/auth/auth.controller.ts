import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly integrationsService: IntegrationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de senha por email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email de recuperação enviado (se o email existir)' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha usando token recebido por email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Token inválido, expirado ou já utilizado' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar se um token de reset ainda é válido' })
  @ApiResponse({ status: HttpStatus.OK, description: '{ valid: boolean }' })
  validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Perfil do usuário atual' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('github')
  @ApiOperation({ summary: 'Inicia o fluxo OAuth com o GitHub' })
  async githubAuth(@Request() req: any, @Query('redirect_uri') customRedirectUri?: string, @Query('state') state?: string) {
    const integrations = await this.integrationsService.getIntegrations();
    const githubConfig = integrations.githubOauth;

    if (!githubConfig?.clientId) {
       // Se não estiver configurado, redireciona o front passando um erro
       const frontUrl = this.configService.get<string>('FRONTEND_URL') || 'https://vertexhub.dev';
       return req.res.redirect(`${frontUrl}/login?error=O Login via GitHub não está habilitado no momento.`);
    }

    const clientId = githubConfig.clientId;
    const apiUrl = this.configService.get<string>('API_URL') || 'https://api.vertexhub.dev';
    const redirectUri = customRedirectUri || `${apiUrl}/v1/auth/github/callback`;
    const scope = 'read:user user:email';

    let githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    if (state) {
      githubAuthUrl += `&state=${encodeURIComponent(state)}`;
    }

    return req.res.redirect(githubAuthUrl);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Callback do fluxo OAuth do GitHub' })
  async githubAuthCallback(@Query('code') code: string, @Query('state') state: string, @Request() req: any) {
    const frontUrl = this.configService.get<string>('FRONTEND_URL') || 'https://vertexhub.dev';

    if (!code) {
      return req.res.redirect(`${frontUrl}/login?error=Código de autorização não fornecido pelo GitHub.`);
    }

    try {
      let linkUserId: string | undefined;
      let redirectPath = '/login';

      if (state && state.startsWith('link:')) {
        linkUserId = state.split(':')[1];
        redirectPath = '/perfil'; // Após vincular, volta pro perfil
      }

      const result = await this.authService.githubLogin(code, linkUserId);
      
      // Sucesso! Redireciona o frontend passando o token JWT
      return req.res.redirect(`${frontUrl}${redirectPath}?token=${result.access_token}`);
      
    } catch (error: any) {
      const errorMsg = encodeURIComponent(error.message || 'Erro ao processar login com GitHub.');
      return req.res.redirect(`${frontUrl}/login?error=${errorMsg}`);
    }
  }
}
