# NextRPC

---

NextRPC is a high-performance, type-safe RPC framework for building scalable and maintainable APIs. It leverages modern TypeScript features to provide a seamless developer experience.

## Features

- **Type Safety**: End-to-end type safety with TypeScript.
- **Performance**: Optimized for low latency and high throughput.
- **Scalability**: Designed to handle large-scale applications.
- **Easy Integration**: Works well with popular frameworks like Next.js, Express, and more

## How to Use

You can start using NextRPC in your project by following these steps:
1. Install the package:
   ```bash
   npm install nextrpc
   ```
2. Set up your route

 ```typescript
// api-handler.ts
import { createRoute } from "@vxti/nextrpc";
import { ValidateIn }  from "./types";

// A basic session validator for NextJS applications, using authjs.
// This can be anything; the returned Session type will be inferred
// in the route handler.
const sessionValidator = async () => await getServerSession(authConfig);

const { handler: getHandler, config: _getConfig } = createRoute({
  path: "/api/api-handler",
  method: "GET",
  sessionValidator,
  requiresAuthentication: true,
  requestHandlers: {
    [ValidateIn.QUERY]: z.object({
      param1: z.string(),
    }),
  },
  handler: async ({ session, data }) => {
    // Your handler logic here

    return NextResponse.json({ message: 'Hello world!' })
  }
});

export default getHandler as GET;

export type ApiGetHandler = typeof _getConfig;
 ```
3. Use your route in your application.
 ```typescript
import { fetchRpc } from '@vxt/nextrpc';

const response = await fetchRpc('/api/api-handler', 'GET', { 
  query: { param1: 'value' }
});

console.log(response); // { message: 'Hello world!' }
```