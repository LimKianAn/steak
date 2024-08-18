# steak

To install bun:

```bash
brew install oven-sh/bun/bun
```

To regenerate code from API [spec](https://docs.blockdaemon.com/reference/staking-api-overview):

```bash
bunx api install "@blockdaemon/v1.0#ldd1ylyr51x6f"
```

To install dependencies:

```bash
bun install
```

To create the `.env` file, which should be filled out:

```bash
mv .env.template .env
```

To run:

```bash
bun run .
```
