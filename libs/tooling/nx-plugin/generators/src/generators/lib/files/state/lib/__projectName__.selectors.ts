import { createSelector } from '@ngrx/store';
import { <%= camelize(projectName) %>sFeature } from './<%= dasherize(projectName) %>.feature';

export const select<%= classify(projectName) %>sView = createSelector(
  <%= camelize(projectName) %>sFeature.select<%= classify(name) %>sState,
  (state) => ({ ...state })
);