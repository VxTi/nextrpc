import {
  type InferBodyValidator,
  type InferQueryValidator,
  type InferReturnType,
  type RouteConfig,
} from './types';

/**
 * Fetch function restricted only to registered paths.
 */
export async function fetchRpc<
  TRouteConfig extends RouteConfig<any, any, any, any, any, any, any, any, any>,
>(
  path: TRouteConfig['path'],
  method: TRouteConfig['method'],
  options: {
    body: InferBodyValidator<TRouteConfig>;
    queryParameters?: InferQueryValidator<TRouteConfig>;
    headers?: Record<string, string>;
  }
): Promise<InferReturnType<TRouteConfig> | undefined> {
  const formattedUrl = new URL(path as string);

  if (options.queryParameters) {
    for (const [key, value] of Object.entries(options.queryParameters)) {
      formattedUrl.searchParams.append(key, String(value));
    }
  }

  try {
    const response = await fetch(formattedUrl, {
      method: method as string,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
      body: method === 'POST' ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as InferReturnType<TRouteConfig>;
  } catch (error) {
    console.error('fetchRpc error:', error);
    return undefined;
  }
}
