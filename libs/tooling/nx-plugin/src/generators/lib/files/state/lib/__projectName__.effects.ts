import { inject } from '@angular/core';
import { catchError, switchMap, map } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { sharedUtilFnErrorTransformer } from "@dv/shared/util-fn/error-transformer";

import { <%= classify(projectName) %>Service } from './<%= dasherize(projectName) %>.service';
import { <%= classify(projectName) %>ApiEvents } from './<%= dasherize(projectName) %>.events';

export const load<%= classify(name) %>s = createEffect(
  (events$ = inject(Actions), <%= camelize(projectName) %>Service = inject(<%= classify(projectName) %>Service)) => {
    return events$.pipe(
      // TODO replace with a trigger event (eg some page init)
      ofType(<%= classify(projectName) %>ApiEvents.dummy),
      switchMap(() =>
        <%= camelize(projectName) %>Service.getAll().pipe(
          map((<%= camelize(name) %>s) => <%= classify(projectName) %>ApiEvents.<%= camelize(name) %>sLoadedSuccess({ <%= camelize(name) %>s })),
          catchError((error) =>
            [<%= classify(projectName) %>ApiEvents.<%= camelize(name) %>sLoadedFailure({ error: sharedUtilFnErrorTransformer(error) })]
          )
        )
      )
    );
  },
  { functional: true }
);

// add effects here
export const <%= camelize(projectName) %>Effects = {load<%= classify(name) %>s};