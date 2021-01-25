const nextEnv = require('next-env')

module.exports = function nextBranchEnv (opts = {}) {
  const skip = opts.skip || false
  const expose = opts.expose || 'NEXT_PUBLIC_BRANCH'
  const verbose = typeof opts.verbose !== 'undefined' ? opts.verbose : true
  const provider = process.env.VERCEL_GIT_PROVIDER || opts.provider || ''
  const owner = process.env.VERCEL_GIT_REPO_OWNER || opts.owner || 'git'
  const repo = process.env.VERCEL_GIT_REPO_SLUG || process.env.GIT_REPO_SLUG || opts.repo || 'local'
  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.VERCEL_GITHUB_COMMIT_REF ||
    process.env.VERCEL_GITLAB_COMMIT_REF ||
    process.env.VERCEL_BITBUCKET_COMMIT_REF ||
    process.env.GIT_COMMIT_REF ||
    process.env.GIT_BRANCH ||
    process.env.BRANCH ||
    opts.branch || ''
  const prefix = opts.prefix || `${owner}/${repo}(${branch}) : `

  if (branch) {
    const BRANCH = branch.toUpperCase()

    if (provider) {
      verbose && console.log(`${prefix}Detected git provider ${provider}.`)
    }
    verbose && console.log(`${prefix}Processing '${branch}' branch environment variables`)

    let overrideCount = 0
    let skipCount = 0
    let writeCount = 0

    Object.entries(process.env).forEach(([key, val]) => {
      let _key

      if (key.indexOf(`_${BRANCH}`) > -1 && key.indexOf(`_${BRANCH}`) === key.length - `_${BRANCH}`.length) {
        _key = key.slice(0, key.indexOf(`_${BRANCH}`))
      } else if (key.indexOf(`${BRANCH}_`) === 0) {
        _key = key.slice(BRANCH.length + 1)
      }

      if (_key) {
        if (process.env[_key] && !skip) {
          process.env[_key] = val
          verbose && console.log(`${prefix}    ${key} -> ${_key} (overridden)`)
          overrideCount++
        } else if (process.env[_key] && skip) {
          verbose && console.log(`${prefix}    ${key} -> ${_key} (skipped)`)
          skipCount++
        } else {
          process.env[_key] = val
          verbose && console.log(`${prefix}    ${key} -> ${_key} (written)`)
          writeCount++
        }
      }
    })

    verbose && console.log(`${prefix}${writeCount + overrideCount} environment variables pulled from '${branch}' environment`)

    if (skip) {
      verbose && console.log(`${prefix}${skipCount} environment variables were skipped, because they already exist in the target environment.`)
      verbose && console.log(`${prefix}Ensure that the 'skip' option is set to 'false' if you want existing environment variables to be overwritten by those in the ${branch} environment.`)
    }

    if (expose) {
      const key = typeof expose === 'string' ? expose : 'NEXT_PUBLIC_BRANCH'
      process.env[key] = branch
      console.log(`${prefix}Branch '${branch}' is exposed as the env variable ${key}=${process.env[key]}`)
    }
  } else {
    console.log(
`next-branch-env : No git provider detected. This is either because: (1) your Vercel deployment was not deployed with git or (2) this is not running on a Vercel deployment. 
  If (1), make sure your git deployment settings are configured correctly in your Vercel Project Settings and your deployment was indeed made through a git hook (and not using the vercel CLI). 
  If (2), you can set the current branch with the 'GIT_BRANCH' environment variable. E.g. 'GIT_BRANCH=$(git branch --show-current) vercel dev'`
    )
  }

  // match Vercel's prefix convention by default
  const withNextEnv = nextEnv({
    serverPrefix: '',
    staticPrefix: 'NEXT_PUBLIC_',
    publicPrefix: 'NEXT_PUBLIC_RUNTIME_',
    ...opts
  })

  return withNextEnv
}
