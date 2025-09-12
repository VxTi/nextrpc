import { type z, type ZodObject, type ZodRawShape } from 'zod/v4';
import { type RouteConfig } from './types';

type ComposeRouteSet<T extends RpcRouteSet> = T extends {
  [K in keyof T]: infer F;
}
  ? F extends RouteConfig<
      any,
      any,
      any,
      any,
      any,
      any,
      infer Path extends string,
      any
    >
    ? { [K in Path]: F }
    : never
  : never;

type RpcRouteSet = Record<
  string,
  RouteConfig<any, any, any, any, any, any, any, any>
>;

type InferValidators<
  Set extends RpcRouteSet,
  Client extends RpcClient<Set>,
  Path extends keyof Client,
> = Client extends { [K in Path]: infer Route }
  ? Route extends RouteConfig<
      any,
      any,
      infer BodyValidator,
      infer QueryValidator,
      infer ParamsValidator,
      any,
      any,
      any
    >
    ? [BodyValidator, QueryValidator, ParamsValidator]
    : never
  : never;

type InferBodyValidator<
  Set extends RpcRouteSet,
  Client extends RpcClient<Set>,
  Path extends keyof Client,
> =
  InferValidators<Set, Client, Path> extends [infer BodyValidator, any, any]
    ? BodyValidator extends ZodRawShape
      ? z.infer<ZodObject<BodyValidator>>
      : never
    : never;

type InferQueryValidator<
  Set extends RpcRouteSet,
  Client extends RpcClient<Set>,
  Path extends keyof Client,
> =
  InferValidators<Set, Client, Path> extends [any, infer QueryValidator, any]
    ? QueryValidator extends ZodRawShape
      ? z.infer<ZodObject<QueryValidator>>
      : never
    : never;

type InferReturnType<
  Set extends RpcRouteSet,
  Client extends RpcClient<Set>,
  Path extends keyof Client,
> = Client extends { [K in Path]: infer Route }
  ? Route extends RouteConfig<
      any,
      any,
      any,
      any,
      any,
      infer ResponseType,
      any,
      any
    >
    ? ResponseType
    : never
  : never;

/**
 * Creates a typed server context object from given routes.
 * The result can only be indexed by registered route paths.
 */
export type RpcClient<Routes extends RpcRouteSet> = ComposeRouteSet<Routes>;

/**
 * Creates a typed server context object from given routes.
 * The result can only be indexed by registered route paths.
 */
export function createRpcClient<T extends RpcRouteSet>(
  routes: T
): RpcClient<T> {
  const server: Partial<RpcClient<T>> = {};

  for (const route of Object.values(routes)) {
    // Re-key it by route.path
    (server as any)[route.path] = route;
  }

  return server as RpcClient<T>;
}

/**
 * Fetch function restricted only to registered paths.
 */
export async function fetchRpc<
  Set extends RpcRouteSet,
  TClient extends RpcClient<Set>,
  TPath extends keyof Set,
>(
  client: TClient,
  path: TPath,
  options: {
    body: InferBodyValidator<Set, TClient, TPath>;
    queryParameters?: InferQueryValidator<Set, TClient, TPath>;
    headers?: Record<string, string>;
  }
): Promise<InferReturnType<Set, TClient, TPath> | undefined> {
  // runtime safety: throw if invalid path sneaks in
  if (!(path in client)) {
    throw new Error(`Path ${String(path)} is not registered on the server`);
  }

  const config = client[path];
  try {
    const response = await fetch(config['path'], {
      method: config.method,
      headers: {
        ...(config.method === 'POST'
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(options.headers ?? {}),
      },
      body: config.method === 'POST' ? JSON.stringify(options.body) : undefined,
    });
    const json = await response.json();

    return json as InferReturnType<Set, TClient, TPath>;
  } catch {
    return undefined;
  }
}
