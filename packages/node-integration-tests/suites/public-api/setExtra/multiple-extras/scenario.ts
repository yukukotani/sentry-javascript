import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://public@dsn.ingest.sentry.io/1337',
  release: '1.0',
});

Sentry.setExtra('extra_1', {
  foo: 'bar',
  baz: {
    qux: 'quux',
  },
});

Sentry.setExtra('extra_2', false);

Sentry.captureMessage('multiple_extras');
