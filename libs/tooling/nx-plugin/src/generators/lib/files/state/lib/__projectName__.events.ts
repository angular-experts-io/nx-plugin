import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const <%= classify(projectName) %>ApiEvents = createActionGroup({
  source: '<%= classify(name) %> API',
  events: {
  // TODO remove dummy
  dummy: emptyProps(),
  // TODO interface should come from a model lib
  <%= camelize(name) %>sLoadedSuccess: props<{ <%= camelize(name) %>s: any[] }>(),
  <%= camelize(name) %>sLoadedFailure: props<{ error: string }>(),
},
});
