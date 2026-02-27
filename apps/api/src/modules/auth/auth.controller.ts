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
import { IntegrationsService, GITHUB_OAUTH_PROVIDER } from '../integrations/integrations.service';
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
  async githubAuth(@Request() req: any, @Query('redirect_uri') customRedirectUri?: string) {
    const integrations = await this.integrationsService.getIntegrations();
    const githubConfig = integrations.githubOauth;

    if (!githubConfig?.clientId) {
       // Se não estiver configurado, redireciona o front passando um erro
       const frontUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
       return req.res.redirect(`${frontUrl}/login?error=O Login via GitHub não está habilitado no momento.`);
    }

    const clientId = githubConfig.clientId;
    const redirectUri = customRedirectUri || `${process.env.API_URL}/v1/auth/github/callback`;
    const scope = 'read:user user:email';

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    return req.res.redirect(githubAuthUrl);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Callback do fluxo OAuth do GitHub' })
  async githubAuthCallback(@Query('code') code: string, @Request() req: any) {
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code) {
      return req.res.redirect(`${frontUrl}/login?error=Código de autorização não fornecido pelo GitHub.`);
    }

    try {
      const result = await this.authService.githubLogin(code);
      
      // Sucesso! Redireciona o frontend passando o token JWT
      return req.res.redirect(`${frontUrl}/login?token=${result.access_token}`);
      
    } catch (error: any) {
      const errorMsg = encodeURIComponent(error.message || 'Erro ao processar login com GitHub.');
      return req.res.redirect(`${frontUrl}/login?error=${errorMsg}`);
    }
  }
}
