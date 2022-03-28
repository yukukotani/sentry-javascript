import { Event } from '@sentry/node';

import { assertSentryEvent, getMultipleEventRequests, runServer } from '../../../../utils';

test('should allow nested scoping', async () => {
  const url = await runServer(__dirname);
  const events = await getMultipleEventRequests(url, 5);

  assertSentryEvent(events[0], {
    message: 'root_before',
    user: {
      id: 'qux',
    },
    tags: {},
  });

  assertSentryEvent(events[1], {
    message: 'outer_before',
    user: {
      id: 'qux',
    },
    tags: {
      foo: false,
    },
  });

  assertSentryEvent(events[2], {
    message: 'inner',
    tags: {
      foo: false,
      bar: 10,
    },
  });

  expect((events[2] as Event).user).toBeUndefined();

  assertSentryEvent(events[3], {
    message: 'outer_after',
    user: {
      id: 'baz',
    },
    tags: {
      foo: false,
    },
  });

  assertSentryEvent(events[4], {
    message: 'root_after',
    user: {
      id: 'qux',
    },
    tags: {},
  });
});
