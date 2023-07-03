import { Route } from '@angular/router';
import { <%= classify(projectName) %>Component } from './<%= dasherize(projectName) %>/<%= dasherize(projectName) %>.component';

export const <%= camelize(projectName) %>Routes: Route[] = [
  {
    path: '',
    pathMatch: 'prefix',
    providers: [
      // feature specific services and other providers
      // always remove { providedIn: 'root' } from the feature specific services
    ],
    children: [
      { path: '', component: <%= classify(projectName) %>Component },
      // add more routes here (siblings)
      // it is also possible to add nested routes as children
      // of this feature root component (or even lazy loaded sub features)
    ]
  },
];