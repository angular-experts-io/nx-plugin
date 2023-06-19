import { select<%= classify(projectName) %>sView } from './<%= dasherize(projectName) %>.selectors';

describe('select<%= classify(projectName) %>sView', () => {
  it('selects view', () => {
    const state = {
      <%= camelize(name) %>s: [],
      loading: false,
      error: null,
    };
    const result = select<%= classify(projectName) %>sView.projector(state);
    expect(result).toEqual(state);
  })
});