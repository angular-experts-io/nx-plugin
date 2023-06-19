# @dv/tooling/nx-plugin

Collection of generators and executors to automate the creation of new projects and libraries
which follow desired architecture to ensure maintainability and consistency across projects in this DV workspace.

## Usage

Run `npm run g` to run main `lib` generator which will prompt you to generate desired library type.

## Library types

### feature - lazy loaded feature

The lazy loaded feature (route or page) is a main building block of an application
and every application consists of one or more lazy loaded features.

Lazy loaded feature brings together multiple `pattern`s, `ui` components, `data-access`es and `util`s
to implement desired business logic.

Feature also often contains feature specific components, directives, pipes and services which
are tightly coupled to the feature and are not shared with features.
These inline entities can be later extracted into separate libraries if they could be reused.

- always lazy loaded by an application
- can contain inline entities

### pattern - eager feature

Pattern represents a combination of multiple libraries and inline entities which is similar to the
feature with one key difference, it's not a self-contained lazy loaded unit of business logic.

A good example of pattern can be something like a `core` which represents reusable combination
of basic infrastructure of an application or things like main layout.

Another great example is any use case where we couple UI component to a specific data-access, such
resulting entity should be implemented as a pattern (UI components should never be coupled to specific data access)

Same logic would follow for things like guards or interceptors which are coupled to specific data access.

As a rule of thumb, if you need to combine multiple libraries and inline entities AND their
combination doesn't represent a lazy loaded feature, then you should create a `pattern`.

- always eagerly imported in another pattern or (lazy) feature
- can contain inline entities

### data-access - headless, NgRx based data access

Data access is a headless library which encapsulates all the NgRx related logic which is responsible
for a single store **state slice** (usually single entity) and exposes
a set of `selectors` and `actions` (we call them `events`) which can be used by other libraries to interact with the store state slice.

It is possible and desirable to create `data-access` libraries which are incomplete, for example
a data access library responsible for re-loading and application when there was a new release
(eg the version changed in some config file in a backend). Such a library would only contain
effect and an action which would periodically check for new version and dispatch an action when a new version is available.

The `data-access` library has to be registered only once in:

1. lazy loaded feature (state of feature)
2. app.config.ts (global state of a single app)
3. core (global state re-used in every app)

- always headless (no components)
- always imported in a feature or pattern
- allows for an universal easy to compose interface (selectors and events) for all business logic

### event - decoupled `data-access` like events that belong to feature (or pattern)

The event library type provides a solution to the following scenario.
A single feature needs to consume state from multiple `data-access` libraries.
More so, the feature has to trigger loading of this data when it's initialized in the running app.

In this case we have the following options:

1. Each data slice defines and exposes feature specific `event`s and the feature dispatches multiple "init" events in its `ngOnInit`, this is bad because it couples `data-access` to consumer features, it needs to know about the feature events, also dispatching multiple events for a single real event is a code smell
2. Feature defines its own events inline - this leads to a cycle in the dep graph where `feature` depends on `data-access` (to consume its data with the help of exposed selectors) and at the same time the `data-access` depends on the feature to consume its events, our architecture should only have one way dep graph (clean, recommended by nx, ...)
3. Use dedicated `event` library which is consumed by both `feature` and related `data-access` libs, one way dep graph is preserved, feature emits single event for single real event, `data-access` libs don't know about impl details of a particular feature

- only contains events (NgRx actions)

### ui - reusable UI components

UI library contains in general single reusable UI component (or a couple of tightly coupled UI components, eg tab group, button, content)
The components should be of plain / view nature and hence reusable and should not contain any business logic.
The components should receive all necessary state through `@Input()` and emit events through `@Output()`.
(or Angular signals based inputs and outputs once available)

- always reusable
- all data should be passed through `@Input()` and events through `@Output()`
- should not contain any business logic

### util - reusable Angular injectable (service, interceptor, validator, ...)

Util library contains in general single (or small group of tightly coupled) reusable Angular injectable (service, interceptor, validator, ...)
so in general an angular entity which is part of Angular dependency injection system.

- always reusable (else create inline service in a `feature` or `pattern`)
- always use Angular dependency injection system (should use `providedIn: 'root'`)

### util-fn - reusable TypeScript function

Util function library contains in general single (or small group of tightly coupled) reusable TypeScript function
which are consumed directly with help of TypeScript import statements and are hence NOT part of the Angular dependency injection system.

- always reusable (else create inline function in a `feature` or `pattern`)

### model - reusable TypeScript types, interfaces, enums, consts ...

Model library contains in general single (or small group of tightly coupled) reusable TypeScript types, interfaces, enums, consts ...

Model is extracted as a separate `root` library type (meaning every other library can consume `model`) to enable and preserve clean one way dependency graph.

- always reusable (else create inline model in a `feature` or `pattern`)

> A lot of best practices above are enforced with the help of the [Nx enforce module boundaries](https://nx.dev/core-features/enforce-project-boundaries) rule.
> as defined in the `.eslintrc.json` file in the `overrides[0].rules.@nx/enforce-module-boundaries[1].depConstraints` section.

## Adding more application scopes

When adding new applications to the workspace with the help of `app` generator it will
automatically update the following two files by adding app as a new scope:

- `libs/tooling/nx-plugin/src/generators/lib/schema.json` file
- `.eslintrc.json` file in the `overrides[0].rules.@nx/enforce-module-boundaries[1].depConstraints` section

That way you will get the new application as an option when running the `lib` generator
to scope your lib to that new application.

The validity of your scopes configuration can be proven by running `npm run validate`.
