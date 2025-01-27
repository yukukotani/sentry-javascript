import { BaseBackend, getEnvelopeEndpointWithUrlEncodedAuth, initAPIDetails } from '@sentry/core';
import { Event, EventHint, Options, Severity, Transport, TransportOptions } from '@sentry/types';
import { supportsFetch } from '@sentry/utils';

import { eventFromException, eventFromMessage } from './eventbuilder';
import { FetchTransport, makeNewFetchTransport, XHRTransport } from './transports';

/**
 * Configuration options for the Sentry Browser SDK.
 * @see BrowserClient for more information.
 */
export interface BrowserOptions extends Options {
  /**
   * A pattern for error URLs which should exclusively be sent to Sentry.
   * This is the opposite of {@link Options.denyUrls}.
   * By default, all errors will be sent.
   */
  allowUrls?: Array<string | RegExp>;

  /**
   * A pattern for error URLs which should not be sent to Sentry.
   * To allow certain errors instead, use {@link Options.allowUrls}.
   * By default, all errors will be sent.
   */
  denyUrls?: Array<string | RegExp>;

  /** @deprecated use {@link Options.allowUrls} instead. */
  whitelistUrls?: Array<string | RegExp>;

  /** @deprecated use {@link Options.denyUrls} instead. */
  blacklistUrls?: Array<string | RegExp>;
}

/**
 * The Sentry Browser SDK Backend.
 * @hidden
 */
export class BrowserBackend extends BaseBackend<BrowserOptions> {
  /**
   * @inheritDoc
   */
  public eventFromException(exception: unknown, hint?: EventHint): PromiseLike<Event> {
    return eventFromException(exception, hint, this._options.attachStacktrace);
  }
  /**
   * @inheritDoc
   */
  public eventFromMessage(message: string, level: Severity = Severity.Info, hint?: EventHint): PromiseLike<Event> {
    return eventFromMessage(message, level, hint, this._options.attachStacktrace);
  }

  /**
   * @inheritDoc
   */
  protected _setupTransport(): Transport {
    if (!this._options.dsn) {
      // We return the noop transport here in case there is no Dsn.
      return super._setupTransport();
    }

    const transportOptions: TransportOptions = {
      ...this._options.transportOptions,
      dsn: this._options.dsn,
      tunnel: this._options.tunnel,
      sendClientReports: this._options.sendClientReports,
      _metadata: this._options._metadata,
    };

    const api = initAPIDetails(transportOptions.dsn, transportOptions._metadata, transportOptions.tunnel);
    const url = getEnvelopeEndpointWithUrlEncodedAuth(api.dsn, api.tunnel);

    if (this._options.transport) {
      return new this._options.transport(transportOptions);
    }
    if (supportsFetch()) {
      const requestOptions: RequestInit = { ...transportOptions.fetchParameters };
      this._newTransport = makeNewFetchTransport({ requestOptions, url });
      return new FetchTransport(transportOptions);
    }
    return new XHRTransport(transportOptions);
  }
}
