import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://public@dsn.ingest.sentry.io/1337',
  release: '1.0',
});

Sentry.addBreadcrumb({
  category: 'foo',
  message: 'bar',
  level: Sentry.Severity.Critical,
});

Sentry.addBreadcrumb({
  category: 'qux',
});

Sentry.captureMessage('test_multi_breadcrumbs');
