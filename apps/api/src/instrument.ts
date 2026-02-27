import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: "https://bd4ce80d998bbf960d89fc0b5f1d3303@o4510959604072448.ingest.us.sentry.io/4510959691694080",
  sendDefaultPii: true,
});
