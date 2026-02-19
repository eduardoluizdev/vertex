import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [ConfigModule, IntegrationsModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
