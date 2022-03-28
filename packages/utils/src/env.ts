/**
 * This module exists for optimizations in the build process through rollup and terser.  We define some global
 * constants, which can be overridden during build. By guarding certain pieces of code with functions that return these
 * constants, we can control whether or not they appear in the final bundle. (Any code guarded by a false condition will
 * never run, and will hence be dropped during treeshaking.) The two primary uses for this are stripping out calls to
 * `logger` and preventing node-related code from appearing in browser bundles.
 */

const __SENTRY_BROWSER_BUNDLE__ = true;

const __SENTRY_DEBUG__ = true;

/**
 * Figures out if we're building with debug functionality.
 *
 * @returns true if this is a debug build
 */
export function isDebugBuild(): boolean {
  return __SENTRY_DEBUG__;
}

const __SENTRY_TRACING__ = true;

/**
 * Figures out if we're building with tracing functionality.
 *
 * @returns true if the build should include tracing code
 */
export function isTracingBuild(): boolean {
  return __SENTRY_TRACING__;
}

/**
 * Figures out if we're building a browser bundle.
 *
 * @returns true if this is a browser bundle build.
 */
export function isBrowserBundle(): boolean {
  return __SENTRY_BROWSER_BUNDLE__;
}
