import { TestBed } from '@angular/core/testing';

import { <%= classify(projectName) %>Service } from './<%= dasherize(projectName) %>.service';

describe('<%= classify(projectName) %>Service', () => {
  let service: <%= classify(projectName) %>Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(<%= classify(projectName) %>Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
