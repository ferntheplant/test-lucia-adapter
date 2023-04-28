# Hacks to test custom Lucia Auth adapter

## Database

The adapter test library just needs a user table with an id and username and then the usual ath keys and auth sessions tables. Check them out in `src/lib/schema`. This schema has a migration under `src/lib/server/database/migrations/0000_far_deadpool.sql`. This file is grabbed in the docker compose config to initialize the schema when the postgres container launches.

## Adapter code

Copy into `src/lib/server/lucia/adapter.ts`. Be sure to limit the user attributes schema to just have an id and username. Notice that the adapter types were setup in an adjacent `./types.ts` file.

## Running the test

The test is setup in `routes/about/+page.server.ts` for easy access. Just navigate to the `/about` page to have the tests run on the server.

### Test setup

In the `routes/about/+page.server.ts` we setup the test by creating a [query handler](https://lucia-auth.com/adapters/testing-adapters) and then instantiating the custom adapter and feeding the query hander and adapter to the `testAdapter` method.

### Query Handler

The query handler just exposes methods for reading or deleting everything from the user/sessions/keys tables and writing a single new user/session/key. Notice that we had to override the `Session` type for inserting due Lucia saying that the `active_expires` and `idle_expires` can be `bigint` but we only accept `number` type.

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
