import { createFeature, createReducer, on } from '@ngrx/store';

import { <%= classify(projectName) %>ApiEvents } from './<%= dasherize(projectName) %>.events';

export interface State {
  // TODO interface should come from a model lib
  <%= camelize(name) %>s: any[];
  loading: boolean;
  error: string | undefined;
}

const initialState: State = {
  <%= camelize(name) %>s: [],
  loading: false,
  error: undefined
};

export const <%= camelize(projectName) %>sFeature = createFeature({
  name: '<%= camelize(name) %>s',
  reducer: createReducer(
    initialState,

    // TODO replace with a trigger event (eg some page init)
    on(<%= classify(projectName) %>ApiEvents.dummy, (state): State => ({
      ...state,
      loading: true,
      error: undefined
    })),

    on(<%= classify(projectName) %>ApiEvents.<%= camelize(name) %>sLoadedSuccess, (state, { <%= camelize(name) %>s }): State => ({
      ...state,
      <%= camelize(name) %>s,
      loading: false,
      error: undefined
    })),
    on(
      <%= classify(projectName) %>ApiEvents.<%= camelize(name) %>sLoadedFailure,
              // add other failure events here (if handled the same way)
(state, { error }): State => ({
      ...state,
      <%= camelize(name) %>s: [],
      loading: false,
      error
    }))
  )
});

export const {
  name, // feature name
  reducer,
  select<%= classify(name) %>sState,
  select<%= classify(name) %>s,
  selectLoading,
  selectError,
} = <%= camelize(projectName) %>sFeature;
