import '@sentry/tracing';

import * as Sentry from '@sentry/node';
import pg from 'pg';

Sentry.init({
  dsn: 'https://public@dsn.ingest.sentry.io/1337',
  release: '1.0',
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: 'transaction',
  name: 'Test Transaction',
});

Sentry.configureScope(scope => {
  scope.setSpan(transaction);
});

const client = new pg.Client();
client.query('SELECT * FROM foo where bar ilike "baz%"', ['a', 'b'], () =>
  client.query('SELECT * FROM bazz', () => {
    client.query('SELECT NOW()', () => transaction.finish());
  }),
);
