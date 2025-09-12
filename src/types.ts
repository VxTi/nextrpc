import type { NextRequest, NextResponse } from 'next/server';
import type { z, ZodObject, ZodRawShape } from 'zod/v4';

export type BooleanType = true | false;

export type RequestParamsType = Record<string, unknown>;

export type ErrorResponse = {
  error: string;
};

export type PossiblyUndefined<
  InitialType,
  Nullable extends BooleanType,
> = Nullable extends true ? InitialType : InitialType | undefined;

export type BasicRequestHandler<RequestParameters> = (
  request: NextRequest,
  { params }: { params: Promise<RequestParameters> }
) => Promise<NextResponse>;

export const enum ValidationType {
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
  [ValidationType.BODY]?: Validator<Body>;
  [ValidationType.QUERY]?: Validator<Query>;
  [ValidationType.PARAMS]?: Validator<Params>;
};

export type Validated<
  Body extends ZodRawShape,
  Query extends ZodRawShape,
  Params extends ZodRawShape,
> = {
  [ValidationType.BODY]?: z.infer<ZodObject<Body>>;
  [ValidationType.QUERY]?: z.infer<ZodObject<Query>>;
  [ValidationType.PARAMS]?: z.infer<ZodObject<Params>>;
};

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
}) => Promise<NextResponse<ResponseType>> | NextResponse<ResponseType>;

export type RouteConfig<
  StrictRequestProcessing extends BooleanType,
  RequiresAuthentication extends BooleanType,
  ZodRequestBodyValidator extends ZodRawShape,
  ZodRequestQueryValidator extends ZodRawShape,
  ZodRequestParamsValidator extends ZodRawShape,
  ResponseType,
  Path extends string,
  UserSession,
> = {
  /**
   * The HTTP method for the route. If not specified, the route will
   * respond to all HTTP methods.
   *
   * @default GET
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

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
  ) => (UserSession | undefined) | Promise<UserSession | undefined>;

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
