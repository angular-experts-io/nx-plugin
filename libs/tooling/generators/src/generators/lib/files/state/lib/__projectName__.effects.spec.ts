import { TestScheduler } from 'rxjs/testing';

import { load<%= classify(name) %>s } from './<%= dasherize(projectName) %>.effects';

import { <%= classify(projectName) %>Service } from './<%= dasherize(projectName) %>.service';
import { <%= classify(projectName) %>ApiEvents } from './<%= dasherize(projectName) %>.events';

describe('<%= classify(projectName) %> Effects', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  it('loads <%= classify(name) %> effect - success', () => {

    scheduler.run(({ expectObservable, hot, cold }) => {
      const <%= camelize(projectName) %>ServiceMock = {
        getAll: () => cold('150ms a', {a: []}),
      } as unknown as <%= classify(projectName) %>Service;

      const eventsMock$ = hot('10ms a', {
        // TODO replace with a trigger event (eg some page init)
        a: <%= classify(projectName) %>ApiEvents.dummy()
      });

      const effectStream$ =  load<%= classify(name) %>s(
        eventsMock$,
        <%= camelize(projectName) %>ServiceMock
      );

      expectObservable(effectStream$).toBe('160ms a', {
        a: <%= classify(projectName) %>ApiEvents.<%= camelize(name)  %>sLoadedSuccess({ <%= camelize(name)  %>s: [] })
      });
    });
  });
});
