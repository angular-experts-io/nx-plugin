import {extractName} from "./projectname";
import {ProjectTypes} from "../model/project-types";

describe('Project name utils', () => {

  it('should extract the correct name of an application', () => {
    expect(
      extractName('foo-football-app', ProjectTypes.APP)
    ).toBe('football-app');
  });

  it('should extract the correct name of a library', () => {
    expect(
      extractName('foo-shared-model-football', ProjectTypes.LIBRARY)
    ).toBe('football');
  });


});
