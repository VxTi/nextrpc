import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createRoute } from './route';
import { createRpcClient, fetchRpc } from './rpc-client';
import { ValidationType } from './types';

const { config } = createRoute({
  path: '/test',
  method: 'POST',
  sessionValidator: () => ({ user: 'yes' }),
  requestValidators: {
    [ValidationType.BODY]: z.object({
      id: z.string(),
    }),
  },
  handler: () => {
    return NextResponse.json({ success: true });
  },
});

const { config: cfg2 } = createRoute({
  path: '/test-request',
  method: 'GET',
  sessionValidator: () => ({ user: 'yes' }),
  requestValidators: {
    [ValidationType.BODY]: z.object({
      test: z.number(),
    }),
  },
  handler: () => {
    return NextResponse.json({ hello: 'world' });
  },
});

const { config: cfg3 } = createRoute({
  path: '/test-request',
  method: 'POST',
  sessionValidator: () => ({ user: 'yes' }),
  requestValidators: {
    [ValidationType.BODY]: z.object({
      test: z.string(),
    }),
  },
  handler: () => {
    return NextResponse.json({ hello: 'world' });
  },
});

const client = createRpcClient({ config, cfg2, cfg3 });

const response = await fetchRpc<typeof client>('/test-request', 'GET', {
  body: { test: "1" },
});
