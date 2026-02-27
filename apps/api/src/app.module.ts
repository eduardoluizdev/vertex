import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { StorageModule } from "./modules/storage/storage.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma.service";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { ServicesModule } from "./modules/services/services.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { WhatsappModule } from "./modules/whatsapp/whatsapp.module";
import { ProposalsModule } from "./modules/proposals/proposals.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    StorageModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    CustomersModule,
    ServicesModule,
    DashboardModule,
    IntegrationsModule,
    NotificationsModule,
    CampaignsModule,
    WhatsappModule,
    ProposalsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    AppService,
    PrismaService,
  ],
})
export class AppModule {}
