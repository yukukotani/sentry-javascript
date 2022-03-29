# Integration Tests for Sentry Node.JS SDK

## Structure

```
suites/
|---- public-api/
      |---- captureMessage/
            |---- test.ts [assertions]
            |---- scenario.ts [Sentry initialization and test subject]
      |---- customTest/
            |---- test.ts [assertions]
            |---- scenario_1.ts [optional extra test scenario]
            |---- scenario_2.ts [optional extra test scenario]
            |---- server_with_mongo.ts [optional custom server]
            |---- server_with_postgres.ts [optional custom server]
utils/
|---- defaults/
      |---- server.ts [default Express server configuration]
```

The tests are grouped by their scopes, such as `public-api` or `tracing`. In every group of tests, there are multiple folders containing test scenarios and assertions.

Tests run on Express servers (a server instance per test). By default, a simple server template inside `utils/defaults/server.ts` is used. Every server instance runs on a different port.

A custom server configuration can be used, supplying a script that exports a valid express server instance as default. `runServer` utility function accepts an optional `serverPath` argument for this purpose.

`scenario.ts` contains the initialization logic and the test subject. By default, `{TEST_DIR}/scenario.ts` is used, but `runServer` also accepts an optional `scenarioPath` argument for non-standard usage.

`test.ts` is required for each test case, and contains the server runner logic, request interceptors for Sentry requests, and assertions. Test server, interceptors and assertions are all run on the same Jest thread.

### Utilities

`utils/` contains helpers and Sentry-specific assertions that can be used in (`test.ts`).

## Running Tests Locally

Tests can be run locally with:

`yarn test`

To run tests with Jest's watch mode:

`yarn test:jest`

To filter tests by their title:

`yarn test -t "set different properties of a scope"`

You can refer to [Jest documentation](https://jestjs.io/docs/cli) for other CLI options.
