import { assertSentryTransaction, getEnvelopeRequest, runServer } from '../../../../utils';

class PgClient {
  // https://node-postgres.com/api/client#clientquery
  public query(_text: unknown, values: unknown, callback?: () => void) {
    if (typeof callback === 'function') {
      callback();
      return;
    }

    if (typeof values === 'function') {
      values();
      return;
    }

    return Promise.resolve();
  }
}

beforeAll(() => {
  jest.mock('pg', () => {
    return {
      Client: PgClient,
      native: {
        Client: PgClient,
      },
    };
  });
});

test('should auto-instrument `pg` package.', async () => {
  const url = await runServer(__dirname);
  const envelope = await getEnvelopeRequest(url);

  expect(envelope).toHaveLength(3);

  assertSentryTransaction(envelope[2], {
    transaction: 'Test Transaction',
    spans: [
      {
        description: 'SELECT * FROM foo where bar ilike "baz%"',
        op: 'db',
      },
      {
        description: 'SELECT * FROM bazz',
        op: 'db',
      },
      {
        description: 'SELECT NOW()',
        op: 'db',
      },
    ],
  });
});
