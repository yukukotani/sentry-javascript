import { assertSentryEvent, getEventRequest, runServer } from '../../../../utils';

test('should work inside catch block', async () => {
  const url = await runServer(__dirname);
  const requestBody = await getEventRequest(url);

  assertSentryEvent(requestBody, {
    exception: {
      values: [
        {
          type: 'Error',
          value: 'catched_error',
          mechanism: {
            type: 'generic',
            handled: true,
          },
          stacktrace: {
            frames: expect.any(Array),
          },
        },
      ],
    },
  });
});
