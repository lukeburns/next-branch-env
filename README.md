# next-branch-env

Branch environments for Next.js deployments on Vercel.

For example, if you need to [create a staging environment](https://vercel.com/knowledge/set-up-a-staging-environment-on-vercel) for your Vercel deployments, you can use this library to make the `STAGING_SECRET` environment variable (defined in your [Vercel Project Settings](https://vercel.com/docs/environment-variables)) available as `SECRET` in Vercel deployments deployed from your `staging` branch.

Uses [next-env](https://github.com/formatlos/next-env) for environment variable injection.

## Installation

In your Next.js project:

```
npm i next-branch-env
```
or
```
yarn add next-branch-env
```

## How it works

The library finds your deployment branch in your Vercel deployment environment and rewrites variables prefixed or postfixed with that branch name. The branch name must be an uppercase prefix or postfix followed by or preceded by an underscore `_`.

All environment variables in the Node.js build process are made available to the Next SSR server. Only environment variables beginning with `NEXT_PUBLIC_` are made available to (are statically embedded in) the Next javascript bundle at build time. Note: `STAGING_NEXT_PUBLIC_ID` is made available as `NEXT_PUBLIC_ID` in `staging` branch deployments, but `NEXT_PUBLIC_STAGING_ID` is not.

### Vercel Configuration

For this to work with your [git-configured](https://vercel.com/docs/git) Vercel deployments:
- 'Automatically expose System Environment Variables' must be checked in your Vercel Project Settings. 
- The Vercel environment (i.e. Production, Preview, and/or Development) assigned to your branch environment variables must include the relevant branch's deployments. For example, [staging environments](https://vercel.com/knowledge/set-up-a-staging-environment-on-vercel#staging-environment-variables) only see environment variables set for the Preview environment, so make sure that e.g. `STAGING_SECRET` is defined as a `Preview` environment variable in your Vercel Project Settings. Otherwise, this library will not see it.

## Usage

### Minimal Configuration

If you don't have to integrate with an existing Next.js configuration file, add the following `next.config.js` to your root directory (adjacent to `package.json`), and if everything is configured appropriately on Vercel, your branch-specific environment variables (defined in your Vercel Project Settings) will be made available to your branch deployments.

```js
// next.config.js
module.exports = require('next-branch-env')()()
```

To see what exactly is happening here, you can run the following example config file directly
```js
// next.config.js
process.env.STAGING_SECRET = 'f5b73b88d0d9d57c831d59c5aa9b09af' // set this in Vercel Project Settings
module.exports = require('next-branch-env')()()
console.log('SECRET =', process.env.SECRET) // SECRET = f5b73b88d0d9d57c831d59c5aa9b09af
```
with
```
BRANCH=staging node next.config
```

See the Options section below for more on what `BRANCH=staging` does.

### Extended Configuration

If you need to integrate with your existing Next.js configuration, the following `next.config.js` file should help.

```js
const withNextBranchEnv = require('next-branch-env')({
  // next-branch-env options
  // next-env default overrides
})

module.exports = withNextBranchEnv((phase, defaultConfig) => {
  // your next.js configuration
  return defaultConfig
})
```

### Local Development Branches

If you want to inject the environment for your current local git branch, you can setup your `package.json` scripts as follows.
```json
{
  "scripts": {
    "dev": "BRANCH=$(git branch --show-current 2>/dev/null||true) next dev",
    "build": "BRANCH=$(git branch --show-current 2>/dev/null||true) next build",
    "start": "BRANCH=$(git branch --show-current 2>/dev/null||true) next start"
  }
}
```
This should ease local development if you want to sync your local `.env` file with Vercel's backend with via `vercel env pull`. The `2>/dev/null||true` ignores the fatal error that occurs if you're not currently in a git repo (e.g. when deploying to Vercel). See next section for more on how this works.

### Options

`next-branch-env` exports a function

```js
const withNextBranchEnv = require('next-branch-env')(options)
```
which accepts `options` that include
```js
const options = {
  skip: false, // skip rewrite if variable already exists, rather than overwrite
  expose: true, // expose branch name as NEXT_PUBLIC_BRANCH variable to the browser
  branch: 'string', // if a branch is not found in env, you can supply your own (alternatively, you can set this as an env var — see below)
  verbose: true, // log rewrites (values are not exposed)
  ...nextEnvOptions, // options for next-env
}
```

Rather than passing in a `branch` parameter, you can define a `BRANCH` or `GIT_COMMIT_REF` variable in your environment. `next-branch-env` will use this as a fallback, if a Vercel git provider (Github, Gitlab, or Bitbucket) is not found, as shown in the above examples.

By default, the exposure of environment variables matches [Vercel's prefix convention](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser): public variables need to be prefixed with `NEXT_PUBLIC_`. You can override these defaults by passing [next-env](https://github.com/formatlos/next-env) options as `next-branch-env` options. Be careful not to expose sensitive data! Don't do this unless you know what you're doing.
