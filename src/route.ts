import { type NextRequest, NextResponse } from 'next/server';
import { type z, type ZodObject, type ZodRawShape } from 'zod/v4';
import {
  type BasicRequestHandler,
  type BooleanType,
  type ErrorResponse,
  type PossiblyUndefined,
  type RouteConfig,
  type Validated,
  type Validator,
  type RequestMethod,
  ValidateIn,
} from './types';

export function createRoute<
  Strict extends BooleanType,
  RequiresAuthentication extends BooleanType,
  BodyValidator extends ZodRawShape,
  QueryValidator extends ZodRawShape,
  ParamsValidator extends ZodRawShape,
  ReturnType,
  Path extends string,
  SessionType,
  Method extends RequestMethod,
>(
  config: RouteConfig<
    Strict,
    RequiresAuthentication,
    BodyValidator,
    QueryValidator,
    ParamsValidator,
    ReturnType,
    Path,
    SessionType,
    Method
  >
): {
  config: RouteConfig<
    Strict,
    RequiresAuthentication,
    BodyValidator,
    QueryValidator,
    ParamsValidator,
    ReturnType,
    Path,
    SessionType,
    Method
  >;
  handler: BasicRequestHandler<z.infer<ZodObject<ParamsValidator>>>;
} {
  const handler = async function (
    request: NextRequest,
    { params }: { params: Promise<z.infer<ZodObject<ParamsValidator>>> }
  ): Promise<NextResponse<ReturnType | ErrorResponse>> {
    try {
      let session: SessionType | undefined = undefined;

      // Check whether a user session validator is provided
      if (config.sessionValidator) {
        session = await config.sessionValidator(request);

        if (!session && config.requiresAuthentication) {
          logVerbose(config.verbose, 'No session found for request');

          return NextResponse.json<ErrorResponse>(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
      }

      const {
        [ValidateIn.BODY]: parsedBody,
        [ValidateIn.PARAMS]: parsedParams,
        [ValidateIn.QUERY]: parsedQueryParams,
      } = await validateRequest(config, request, params);

      return await config.handler({
        request,
        data: parsedBody as PossiblyUndefined<
          z.infer<ZodObject<BodyValidator>>,
          Strict
        >,
        session: session as PossiblyUndefined<
          SessionType,
          RequiresAuthentication
        >,
        searchParameters: parsedQueryParams as PossiblyUndefined<
          z.infer<ZodObject<QueryValidator>>,
          Strict
        >,
        params: parsedParams as PossiblyUndefined<
          z.infer<ZodObject<ParamsValidator>>,
          Strict
        >,
      });
    } catch (error) {
      logVerbose(config.verbose, '[500]: Error in API route handler:', error);

      return NextResponse.json<ErrorResponse>(
        {
          error:
            'Internal server error. Please try again later. If the problem persists, please contact us at info@kaaspaleisdemare.nl',
        },
        {
          status: 500,
        }
      );
    }
  };

  return { config, handler };
}

async function validateRequest<
  TBody extends ZodRawShape,
  TQuery extends ZodRawShape,
  TParams extends ZodRawShape,
>(
  config: RouteConfig<any, any, TBody, TQuery, TParams, any, any, any, any>,
  request: NextRequest,
  paramsPromise: Promise<any>
): Promise<Validated<TBody, TQuery, TParams>> {
  const validators = Object.entries(config.requestValidators ?? {}) as [
    ValidateIn,
    Validator<TBody | TQuery | TParams>,
  ][];

  const validationResults: Validated<TBody, TQuery, TParams> = {};

  for (const [$in, validator] of validators) {
    let validationData: any;
    const validationType = $in as ValidateIn;

    switch (validationType) {
      case 'body': {
        validationData = await request.json();
        break;
      }
      case 'query': {
        const searchParams = new URL(request.url).searchParams;
        validationData = Object.fromEntries(searchParams);
        break;
      }
      case 'params': {
        validationData = await paramsPromise;
        break;
      }
    }

    const validationResult = await validator.safeParseAsync(validationData);

    if (!validationResult.success && config.strict) {
      throw new Error(`Invalid request data received for '${$in}'`);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    validationResults[validationType] = validationResult.data;
  }

  return validationResults;
}

function logVerbose(
  verbose: boolean | undefined,
  message: string,
  ...args: unknown[]
) {
  if (verbose) console.debug(message, ...args);
}
