import { EventEnvelope, EventItem } from '@sentry/types';
import { createEnvelope, serializeEnvelope } from '@sentry/utils';
import { makeNewXHRTransport, XHRTransportOptions } from '../../../src/transports/new-xhr';

const DEFAULT_XHR_TRANSPORT_OPTIONS: XHRTransportOptions = {
  url: 'https://sentry.io/api/42/store/?sentry_key=123&sentry_version=7',
};

const ERROR_ENVELOPE = createEnvelope<EventEnvelope>({ event_id: 'aa3ff046696b4bc6b609ce6d28fde9e2', sent_at: '123' }, [
  [{ type: 'event' }, { event_id: 'aa3ff046696b4bc6b609ce6d28fde9e2' }] as EventItem,
]);

function createXHRMock() {
  const retryAfterSeconds = 10;

  const xhrMock: Partial<XMLHttpRequest> = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: 200,
    response: 'Hello World!',
    onreadystatechange: () => {},
    getResponseHeader: jest.fn((header: string) => {
      switch (header) {
        case 'Retry-After':
          return '10';
        case `${retryAfterSeconds}`:
          return;
        default:
          return `${retryAfterSeconds}:error:scope`;
      }
    }),
  };

  // casting `window` as `any` because XMLHttpRequest is missing in Window (TS-only)
  jest.spyOn(window as any, 'XMLHttpRequest').mockImplementation(() => xhrMock as XMLHttpRequest);

  return xhrMock;
}

describe('NewXHRTransport', () => {
  const xhrMock: Partial<XMLHttpRequest> = createXHRMock();

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('makes an XHR request to the given URL', async () => {
    const transport = makeNewXHRTransport(DEFAULT_XHR_TRANSPORT_OPTIONS);
    expect(xhrMock.open).toHaveBeenCalledTimes(0);
    expect(xhrMock.setRequestHeader).toHaveBeenCalledTimes(0);
    expect(xhrMock.send).toHaveBeenCalledTimes(0);

    await Promise.all([transport.send(ERROR_ENVELOPE), (xhrMock as XMLHttpRequest).onreadystatechange(null)]);

    expect(xhrMock.open).toHaveBeenCalledTimes(1);
    expect(xhrMock.open).toHaveBeenCalledWith('POST', DEFAULT_XHR_TRANSPORT_OPTIONS.url);
    expect(xhrMock.send).toHaveBeenCalledTimes(1);
    expect(xhrMock.send).toHaveBeenCalledWith(serializeEnvelope(ERROR_ENVELOPE));
  });

  it('returns the correct response', async () => {
    const transport = makeNewXHRTransport(DEFAULT_XHR_TRANSPORT_OPTIONS);

    const [res] = await Promise.all([
      transport.send(ERROR_ENVELOPE),
      (xhrMock as XMLHttpRequest).onreadystatechange(null),
    ]);

    expect(res).toBeDefined();
    expect(res.status).toEqual('success');
  });

  it('sets rate limit response headers', async () => {
    const transport = makeNewXHRTransport(DEFAULT_XHR_TRANSPORT_OPTIONS);

    await Promise.all([transport.send(ERROR_ENVELOPE), (xhrMock as XMLHttpRequest).onreadystatechange(null)]);

    expect(xhrMock.getResponseHeader).toHaveBeenCalledTimes(2);
    expect(xhrMock.getResponseHeader).toHaveBeenCalledWith('X-Sentry-Rate-Limits');
    expect(xhrMock.getResponseHeader).toHaveBeenCalledWith('Retry-After');
  });

  it('sets custom request headers', async () => {
    const headers = {
      referrerPolicy: 'strict-origin',
      keepalive: 'true',
      referrer: 'http://example.org',
    };
    const options: XHRTransportOptions = {
      ...DEFAULT_XHR_TRANSPORT_OPTIONS,
      headers,
    };

    const transport = makeNewXHRTransport(options);
    await Promise.all([transport.send(ERROR_ENVELOPE), (xhrMock as XMLHttpRequest).onreadystatechange(null)]);

    expect(xhrMock.setRequestHeader).toHaveBeenCalledTimes(3);
    expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('referrerPolicy', headers.referrerPolicy);
    expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('keepalive', headers.keepalive);
    expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('referrer', headers.referrer);
  });
});
