import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { SharedModelError } from "@dv/shared/model/error";

export const <%= classify(projectName) %>ApiEvents = createActionGroup({
  source: '<%= classify(name) %> API',
  events: {
  // TODO remove dummy
  dummy: emptyProps(),
  // TODO interface should come from a model lib
  <%= camelize(name) %>sLoadedSuccess: props<{ <%= camelize(name) %>s: any[] }>(),
  <%= camelize(name) %>sLoadedFailure: props<{ error: SharedModelError }>(),
},
});