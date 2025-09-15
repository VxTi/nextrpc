import type { NextRequest, NextResponse } from 'next/server';
import type { z, ZodObject, ZodRawShape } from 'zod/v4';

/**
 * A type representing a boolean value, differing from the standard `boolean` type.
 * This type is specifically defined to allow for more precise type constraints
 */
export type BooleanType = true | false;

export type RequestParamsType = Record<string, unknown>;

export type ErrorResponse = {
  error: string;
};

/**
 * The HTTP methods supported by the route handler.
 */
export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS';

type MaybePromise<T> = T | Promise<T>;

export type PossiblyUndefined<
  InitialType,
  Nullable extends BooleanType,
> = Nullable extends true ? InitialType : InitialType | undefined;

export type BasicRequestHandler<RequestParameters> = (
  request: NextRequest,
  { params }: { params: Promise<RequestParameters> }
) => Promise<NextResponse>;

export const enum ValidateIn {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
}
export type Validator<T extends ZodRawShape> = ZodObject<T>;

export type Validators<
  Body extends ZodRawShape,
  Query extends ZodRawShape,
  Params extends ZodRawShape,
> = {
  [ValidateIn.BODY]?: Validator<Body>;
  [ValidateIn.QUERY]?: Validator<Query>;
  [ValidateIn.PARAMS]?: Validator<Params>;
};

export type Validated<
  Body extends ZodRawShape,
  Query extends ZodRawShape,
  Params extends ZodRawShape,
> = {
  [ValidateIn.BODY]?: z.infer<ZodObject<Body>>;
  [ValidateIn.QUERY]?: z.infer<ZodObject<Query>>;
  [ValidateIn.PARAMS]?: z.infer<ZodObject<Params>>;
};

/**
 * Infer the body validator type from a RouteConfig
 */
export type InferBodyValidator<T> =
  T extends RouteConfig<
    any,
    any,
    infer BodyValidator,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? BodyValidator extends ZodRawShape
      ? z.infer<ZodObject<BodyValidator>>
      : never
    : never;

/**
 * Infer the query validator type from a RouteConfig
 */
export type InferQueryValidator<T> =
  T extends RouteConfig<
    any,
    any,
    any,
    infer QueryValidator,
    any,
    any,
    any,
    any,
    any
  >
    ? QueryValidator extends ZodRawShape
      ? z.infer<ZodObject<QueryValidator>>
      : never
    : never;

export type InferReturnType<T> =
  T extends RouteConfig<
    any,
    any,
    any,
    any,
    any,
    infer ResponseType,
    any,
    any,
    any
  >
    ? ResponseType
    : never;

export type RequestHandler<
  TBody,
  TQueryParams,
  Strict extends BooleanType,
  RequiresAuthentication extends BooleanType,
  TParams extends RequestParamsType | undefined,
  ResponseType,
  SessionType,
> = ({
  request,
  data,
  session,
  searchParameters,
  params,
}: {
  request: NextRequest;
  data: PossiblyUndefined<TBody, Strict>;
  session: PossiblyUndefined<SessionType, RequiresAuthentication>;
  searchParameters: PossiblyUndefined<TQueryParams, Strict>;
  params: PossiblyUndefined<TParams, Strict>;
}) => MaybePromise<NextResponse<ResponseType>>;

export type RouteConfig<
  StrictRequestProcessing extends BooleanType,
  RequiresAuthentication extends BooleanType,
  ZodRequestBodyValidator extends ZodRawShape,
  ZodRequestQueryValidator extends ZodRawShape,
  ZodRequestParamsValidator extends ZodRawShape,
  ResponseType,
  Path extends string,
  UserSession,
  Method extends RequestMethod,
> = {
  /**
   * The HTTP method for the route. If not specified, the route will
   * respond to all HTTP methods.
   */
  method: Method;

  /**
   * The path for the route, e.g., `/api/products/[id]`
   */
  path: Path;

  /**
   * A boolean flag that indicates whether to enable verbose logging output.
   * If set to true, additional detailed information may be logged for debugging or analysis purposes.
   * This property is optional and defaults to false if not specified.
   *
   * @default false
   */
  verbose?: boolean;

  /**
   * Whether the body validation is strictly required.
   * When set to `true`, if body validation fails, the handler
   * will return a 400 response.
   *
   * Defaults to false
   */
  strict?: StrictRequestProcessing;

  /**
   * The request handler. This handler is called after preprocessing has
   * succeeded, e.g., body validation or authentication.
   */
  handler: RequestHandler<
    z.infer<ZodObject<ZodRequestBodyValidator>>,
    z.infer<ZodObject<ZodRequestQueryValidator>>,
    StrictRequestProcessing,
    RequiresAuthentication,
    z.infer<ZodObject<ZodRequestParamsValidator>>,
    ResponseType,
    UserSession
  >;

  /**
   * Validates and returns the user session.
   * If this is provided, the session is validated before
   * calling the handler. If validation fails and `requiresAuthentication`
   * is set to `true`, a 401 response is returned.
   * If `requiresAuthentication` is `false`, the handler is called with
   * `session` set to `undefined`.
   */
  sessionValidator?: (
    request: NextRequest
  ) => MaybePromise<UserSession | undefined>;

  /**
   * Validates the request data, e.g., the body of a `POST` request.
   * If this is provided, the request data is validated before
   * calling the handler. If validation fails and `strict` is set to `true`,
   * a 400 response is returned.
   * If `strict` is `false`, the handler is called with `data` set to `undefined`.
   */
  requestValidators?: Validators<
    ZodRequestBodyValidator,
    ZodRequestQueryValidator,
    ZodRequestParamsValidator
  >;

  /**
   * Whether the route requires authentication.
   *
   * @defaults false
   */
  requiresAuthentication?: RequiresAuthentication;
};
