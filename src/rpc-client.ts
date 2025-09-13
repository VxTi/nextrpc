import {
  type InferBodyValidator,
  type InferQueryValidator,
  type InferReturnType,
  type RouteConfig,
} from './types';

type RpcRouteSet = Record<
  string,
  RouteConfig<any, any, any, any, any, any, any, any, any>
>;

export type RpcClient<RouteSet extends RpcRouteSet> = {
  [R in keyof RouteSet as RouteSet[R]['path']]: {
    [M in RouteSet[R]['method']]: Extract<RouteSet[R], { method: M }>;
  };
};

export function createRpcClient<RpcRoutes extends RpcRouteSet>(
  routes: RpcRoutes
): RpcClient<RpcRoutes> {
  const client: any = {};

  for (const route of Object.values(routes)) {
    if (!client[route.path]) {
      client[route.path] = {};
    }
    client[route.path][route.method] = route;
  }

  return client as RpcClient<RpcRoutes>;
}

/**
 * Fetch function restricted only to registered paths.
 */
export async function fetchRpc<TRpcClient extends RpcClient<any>>(
  path: keyof TRpcClient,
  method: TRpcClient[typeof path][keyof TRpcClient[typeof path]]['method'],
  options: {
    body: InferBodyValidator<TRpcClient[typeof path][typeof method]>;
    queryParameters?: InferQueryValidator<
      TRpcClient[typeof path][typeof method]
    >;
    headers?: Record<string, string>;
  }
): Promise<
  InferReturnType<TRpcClient[typeof path][typeof method]> | undefined
> {
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

    return (await response.json()) as InferReturnType<
      TRpcClient[typeof path][typeof method]
    >;
  } catch (error) {
    console.error('fetchRpc error:', error);
    return undefined;
  }
}
