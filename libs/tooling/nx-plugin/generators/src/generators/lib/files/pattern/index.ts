/**
 * Pattern is an eagerly loaded feature
 * or in other words a combination of other utils, data-access, ui, etc...
 * which are imported eagerly in eager part of the application or other lazy loaded features
 *
 * Please, put implementation in the /lib folder which should be a sibling od this index.ts file.
 *
 *
 * Examples:
 *
 * 1. collection of preconfigured providers
 * export function provide<Scope>Pattern<Name>() {
 *   return [
 *     ...providers (and their configuration, ...)
 *   ]
 * }
 *
 * 2. a piece of reusable logic  (eg components + data accesses)
 *    which is shared by multiple lazy loaded features
 *    eg generic comments feature, document management feature, ...
 */
