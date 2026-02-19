import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const integrations = await this.integrationsService.getIntegrations();
    const { apiKey, frontendUrl, fromEmail } = integrations.resend;

    if (!apiKey || !apiKey.startsWith('re_')) {
      this.logger.error('Resend API Key is missing or invalid.');
      throw new Error('Email service configuration error');
    }

    const resend = new Resend(apiKey);
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = this.buildPasswordResetTemplate(name, resetUrl);

    try {
      const { error } = await resend.emails.send({
        from: fromEmail || 'VertexHub <no-reply@vertexhub.dev>',
        to: email,
        subject: '🔑 Recuperação de Senha — VertexHub',
        html,
      });

      if (error) {
        this.logger.error('Falha ao enviar email de recuperação', error);
        throw new Error('Falha ao enviar email');
      }

      this.logger.log(`Email de recuperação enviado para ${email}`);
    } catch (err) {
      this.logger.error('Erro ao enviar email via Resend', err);
      throw err;
    }
  }

  private buildPasswordResetTemplate(name: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperação de Senha — VertexHub</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:16px;padding:12px 20px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                      &#9670; VertexHub
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 40px;">

              <!-- Ícone -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="display:inline-block;background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2));border:1px solid rgba(124,58,237,0.4);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;font-size:32px;">
                      🔑
                    </div>
                  </td>
                </tr>

                <!-- Título -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                      Recuperação de Senha
                    </h1>
                  </td>
                </tr>

                <!-- Subtítulo -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;color:#9ca3af;font-size:16px;line-height:1.6;">
                      Olá, <strong style="color:#c4b5fd;">${name}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta no VertexHub.
                    </p>
                  </td>
                </tr>

                <!-- Divisor -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent);"></div>
                  </td>
                </tr>

                <!-- Mensagem principal -->
                <tr>
                  <td style="padding-bottom:32px;">
                    <p style="margin:0;color:#d1d5db;font-size:15px;line-height:1.7;text-align:center;">
                      Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong style="color:#c4b5fd;">1 hora</strong> e só pode ser usado uma vez.
                    </p>
                  </td>
                </tr>

                <!-- Botão CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 4px 24px rgba(124,58,237,0.4);">
                      &#8594; Redefinir minha senha
                    </a>
                  </td>
                </tr>

                <!-- Aviso de segurança -->
                <tr>
                  <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                    <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;text-align:center;">
                      ⚠️ Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanece a mesma e nenhuma alteração foi feita.
                    </p>
                  </td>
                </tr>

                <!-- Link alternativo -->
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;line-height:1.6;">
                      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                    </p>
                    <p style="margin:8px 0 0;text-align:center;">
                      <a href="${resetUrl}" style="color:#8b5cf6;font-size:12px;word-break:break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} VertexHub. Todos os direitos reservados.
              </p>
              <p style="margin:8px 0 0;color:#374151;font-size:11px;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
