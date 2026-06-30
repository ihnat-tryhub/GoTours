const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again in a moment.';

const TECHNICAL_ERROR_PATTERNS = [
  /openssl/i,
  /ssl routines/i,
  /tls_validate_record_header/i,
  /wrong version number/i,
  /node_modules/i,
  /mongodb/i,
  /mongoose/i,
  /cast to/i,
  /validationerror/i,
  /typeerror/i,
  /referenceerror/i,
  /syntaxerror/i,
  /econnrefused/i,
  /enotfound/i,
  /eai_again/i,
  /failed to fetch/i,
];

function isTechnicalMessage(message: string): boolean {
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function normalizeApiErrorMessage(
  message?: string,
  status?: number,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return status && status >= 500 ? 'The server is having trouble right now.' : fallback;
  }

  if (/failed to fetch/i.test(trimmedMessage)) {
    return 'Could not connect to the GoTours API. Please check that the server is running.';
  }

  if (isTechnicalMessage(trimmedMessage)) {
    return status && status >= 500
      ? 'The server could not finish this request right now. Please try again in a moment.'
      : fallback;
  }

  if (status && status >= 500) {
    return 'The server is having trouble right now. Please try again shortly.';
  }

  return trimmedMessage;
}

export function getFriendlyErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof Error) {
    return normalizeApiErrorMessage(error.message, undefined, fallback);
  }

  if (typeof error === 'string') {
    return normalizeApiErrorMessage(error, undefined, fallback);
  }

  return fallback;
}
