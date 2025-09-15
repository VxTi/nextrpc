import type { FetchRpcInit, InferReturnType, RouteConfig } from './types';

/**
 * A generic function to perform RPC calls to a specified route.
 *
 * @template TRouteConfig - The route configuration type defining the path, method, body, query parameters, and return type.
 * @param path - The endpoint path to call, extracted from the route configuration generic.
 * @param method - The HTTP method to use (e.g., 'GET', 'POST'), extracted from the route configuration generic.
 * @param options - An object containing the request body, optional query parameters, and optional headers.
 * @returns A promise that resolves to the response data or undefined in case of an error.
 */
export async function fetchRpc<
  TRouteConfig extends RouteConfig<any, any, any, any, any, any, any, any, any>,
>(
  path: TRouteConfig['path'],
  method: TRouteConfig['method'],
  options: FetchRpcInit<TRouteConfig>
): Promise<InferReturnType<TRouteConfig> | undefined> {
  const formattedUrl: string = options.query
    ? `${path}?${options.query}`
    : path;

  const body: string | undefined =
    method === 'POST' && options.body
      ? JSON.stringify(options.body)
      : undefined;

  try {
    const response = await fetch(formattedUrl, {
      ...options,
      method: method as string,
      headers: {
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
      body,
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
