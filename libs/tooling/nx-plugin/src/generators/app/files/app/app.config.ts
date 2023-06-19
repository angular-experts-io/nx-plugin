import { ApplicationConfig } from '@angular/core';

import { provideSharedPatternCore } from '@dv/shared/pattern/core';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideSharedPatternCore(appRoutes)],
};
