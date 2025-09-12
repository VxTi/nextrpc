import { NextResponse } from 'next/server';
import { createRoute } from './route';
import { createRpcClient, fetchRpc } from './rpc-client';
import { z } from 'zod/v4';
import { ValidationType } from './types';

const { config } = createRoute({
  path: '/test',
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
  sessionValidator: () => ({ user: 'yes' }),
  requestValidators: {
    [ValidationType.BODY]: z.object({
      id: z.string(),
    }),
  },
  handler: () => {
    return NextResponse.json({ hello: 'world' } as const);
  },
});

const client = createRpcClient({ config, cfg2 });

const response = await fetchRpc(client, '/test-request', {
  body: { id: 'test' },
});
