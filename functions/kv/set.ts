import { nanoid } from 'nanoid';
import { KV_ERROR_MESSAGE, isKvError, createKvErrorResponse } from '../shared/constants';

export function validateHtml(value: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if string contains basic HTML structure
  const hasHtmlTag = /<html[^>]*>/i.test(value);
  const hasBodyTag = /<body[^>]*>/i.test(value);

  if (!hasHtmlTag) {
    return {
      isValid: false,
      error: 'Value must contain an HTML tag.',
    };
  }

  if (!hasBodyTag) {
    return {
      isValid: false,
      error: 'Value must contain a BODY tag.',
    };
  }

  return {
    isValid: true,
  };
}

// Core deployment logic that can be reused
export async function deployHtmlToKv(value: string, baseUrl: string): Promise<string> {
  // Validate input
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  // Validate HTML
  const validationResult = validateHtml(value);
  if (!validationResult.isValid) {
    throw new Error(validationResult.error || 'Invalid HTML document');
  }

  // Generate unique key and store in KV
  const key = nanoid();

  try {
    // @ts-ignore -  KV binding
    await my_kv.put(key, value);
  } catch (error) {
    if (isKvError(error)) {
      throw new Error(KV_ERROR_MESSAGE);
    }
    throw error;
  }

  const shareUrl = `${baseUrl}/share/${key}`;
  return shareUrl;
}

interface ResponseData {
  [key: string]: string;
}

export function createResponse(data: ResponseData, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

interface RequestContext {
  request: Request;
}

export async function onRequest({
  request,
}: RequestContext): Promise<Response> {
  if (request.method !== 'POST') {
    return createResponse({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const baseUrl = url.protocol + '//' + url.host;

  try {
    // Parse request body
    const body = await request.clone().json();
    const { value } = body;

    // Use the shared deployment logic
    const shareUrl = await deployHtmlToKv(value, baseUrl);

    // Extract key from the URL for backward compatibility
    const key = shareUrl.split('/share/')[1];

    // Return successful response
    return createResponse({
      key,
      url: shareUrl,
    });
  } catch (err: any) {
    console.error('Error processing request:', err);

    // Check if it's a KV-related error
    if (isKvError(err)) {
      return createResponse(createKvErrorResponse(err), 500);
    }

    // If error message already contains KV error message, return it directly
    if (err.message?.includes(KV_ERROR_MESSAGE)) {
      return createResponse({ error: err.message }, 500);
    }

    return createResponse(
      {
        error: 'Create failed',
        message: err.message || 'Unknown error',
      },
      500
    );
  }
}
