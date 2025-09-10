// KV Storage error message constant
export const KV_ERROR_MESSAGE = 'my_kv not found, please check your EdgeOne Pages KV settings. For more information, please refer to https://pages.edgeone.ai/document/kv-storage';

// Helper function to check if error is KV-related
export function isKvError(error: any): boolean {
  // Check for common KV binding errors
  return (
    error?.message?.includes('my_kv') ||
    error?.message?.includes('KV') ||
    error?.message?.includes('binding') ||
    error?.name === 'ReferenceError' ||
    error?.code === 'ERR_BINDING_NOT_FOUND'
  );
}

// Helper function to create standardized KV error response
export function createKvErrorResponse(originalError?: any): { error: string; message?: string } {
  console.error('KV Error:', originalError);

  // Avoid duplicate error messages
  const originalMessage = originalError?.message;
  const shouldIncludeMessage = originalMessage && originalMessage !== KV_ERROR_MESSAGE;

  return {
    error: KV_ERROR_MESSAGE,
    ...(shouldIncludeMessage && { message: originalMessage })
  };
}
