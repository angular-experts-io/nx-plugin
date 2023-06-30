import { createActionGroup, emptyProps } from '@ngrx/store';

export const <%= classify(projectName) %> = createActionGroup({
  source: '<%= classify(name) %> Page', // TODO rename page to whatever is appropriate
  events: {
    init: emptyProps(),
  },
});