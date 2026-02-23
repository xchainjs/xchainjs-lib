# Self-Feedback Loop Workflow

## Overview

The XChainJS Testing GUI includes a self-feedback loop that helps identify bugs, create PRs to fix them, and verify the fixes - all within the xchainjs ecosystem.

## Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ISSUE DISCOVERY                              │
│  Asgardex Desktop (or other consumer) encounters blockchain issue    │
│  (or issue is discovered directly in testing-gui)                    │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CHECK KNOWN ISSUES                              │
│  1. Check .claude/projects/.../memory/MEMORY.md for known issues     │
│  2. If issue is documented, check if workaround exists               │
│  3. If not documented, proceed to reproduction                       │
│                                                                      │
│  Known issues are tracked in MEMORY.md under "Known Issues / TODO"   │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REPRODUCE IN TESTING GUI                        │
│  1. Open testing-gui (yarn dev)                                      │
│  2. Connect wallet with test mnemonic                                │
│  3. Select the problematic chain                                     │
│  4. Execute the failing operation                                    │
│  5. Capture error details and stack trace                            │
│                                                                      │
│  Note: testing-gui uses workspace:* dependencies, so local xchainjs  │
│  packages are automatically linked after running yarn build          │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CREATE TEST CASE                               │
│  1. Write a failing test in packages/xchain-{chain}/__tests__/       │
│     e.g., packages/xchain-bitcoin/__tests__/balance.test.ts          │
│  2. Test should reproduce the exact issue                            │
│  3. Commit test: "test: reproduce [ISSUE] in xchain-{chain}"         │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CREATE FIX PR                                │
│  1. Create branch: fix/{chain}-{issue-description}                   │
│  2. Implement fix in packages/xchain-{chain}/src/                    │
│  3. Verify test now passes                                           │
│  4. Add changeset: yarn changeset                                    │
│  5. Create PR with:                                                  │
│     - Link to Asgardex issue (if applicable)                         │
│     - Steps to reproduce in testing-gui                              │
│     - Test coverage for the fix                                      │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VERIFY IN TESTING GUI                           │
│  1. Build packages: yarn build                                       │
│  2. Run testing-gui against fixed packages                           │
│  3. Confirm operation now succeeds                                   │
│  4. Document fix verification in PR                                  │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY & DEPENDENCY CHECK                       │
│  1. Run dependency audit: yarn audit                                 │
│  2. Check for vulnerable packages via Dependabot alerts              │
│  3. Review any new dependencies added in PR                          │
│  4. Use Snyk or npm audit for additional scanning                    │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UPDATE ASGARDEX DEPENDENCY                        │
│  1. After PR merge, version is published via changesets              │
│  2. Update Asgardex package.json to use new version                  │
│  3. Test Asgardex against new xchainjs build                         │
│  4. Verify fix in production context                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Issue Classification

Before reproduction, determine issue type:

| Type | Description | Approach |
|------|-------------|----------|
| **Code Issue** | Bug in xchainjs logic | Reproducible with test data |
| **Network Issue** | RPC/API endpoint problems | May need specific provider config |
| **Data Issue** | Requires specific blockchain state | Document required state (UTXOs, balances) |
| **Environment Issue** | Mainnet vs testnet specific | Note which network to test |

## Error Logging (Implemented)

The testing GUI now logs errors in a structured JSON format to help with issue reproduction:

```typescript
// Errors are logged automatically via useOperation hook
// Format: [XChainJS Error] { timestamp, chainId, operation, error, stack, params, duration }
```

To use structured logging in operation components:
```typescript
const { execute } = useOperation<ResultType>()

// Pass context for better error tracking
await execute(
  async () => client.getBalance(address),
  { chainId: 'BTC', operation: 'getBalance', params: { address } }
)
```

Errors appear in browser console and can be filtered with `[XChainJS Error]`.

## Automated Issue Detection (Future)

### Continuous Testing Mode

```bash
# Run automated tests against all chains
yarn test:chains --continuous

# Output issues to JSON for processing
yarn test:chains --output issues.json
# Output format: [{ chainId, operation, error, params, timestamp }]
```

### Auto-PR Creation

When the testing GUI detects an issue, it can:

1. **Log the issue** with full context:
   - Chain ID
   - Operation type
   - Error message and stack
   - Input parameters
   - Expected vs actual behavior

2. **Create a GitHub issue** automatically:
   ```
   gh issue create \
     --title "[xchain-{chain}] {operation} fails: {error}" \
     --body "$(cat issue-template.md)"
   ```

3. **Create a fix branch**:
   ```
   git checkout -b fix/{chain}-{issue-hash}
   ```

4. **Generate test scaffold**:
   ```typescript
   // Auto-generated test for issue #{issue-number}
   it('should handle {operation} correctly', async () => {
     const client = createClient('{chain}', config)
     // Reproduce the issue
     await expect(client.{operation}(params))
       .rejects.toThrow('{error}')  // Currently fails
     // After fix, change to:
     // .resolves.toEqual(expected)
   })
   ```

## Example: BTC Balance Issue

### 1. Issue Discovered
Asgardex shows incorrect BTC balance after consolidation.

### 2. Reproduce in Testing GUI
```
1. Connect wallet
2. Select BTC chain
3. Click "Get Balance"
4. Observe: Shows 0.5 BTC
5. Expected: 1.2 BTC (based on explorer)
```

### 3. Create Test Case
```typescript
// packages/xchain-bitcoin/__tests__/balance.test.ts
it('should include unconfirmed UTXOs in balance', async () => {
  const client = new Client({ ...defaultBTCParams, phrase: TEST_PHRASE })
  const balance = await client.getBalance(address)
  // This should include pending/unconfirmed
  expect(balance[0].amount.amount().toNumber())
    .toBeGreaterThan(0)
})
```

### 4. Create Fix PR
```bash
git checkout -b fix/btc-unconfirmed-balance
# Make changes to packages/xchain-bitcoin/src/client.ts
git commit -m "fix(bitcoin): include unconfirmed UTXOs in balance"
yarn changeset  # Add changeset for version bump
gh pr create --title "fix(bitcoin): include unconfirmed UTXOs in balance"
```

### 5. Verify in Testing GUI
- Rebuild packages: `yarn build`
- Retest in GUI
- Confirm balance now shows 1.2 BTC

## Integration with CI/CD

### GitHub Actions Workflow

```yaml
name: Testing GUI Regression
on:
  pull_request:
    paths:
      - 'packages/xchain-*/src/**'

jobs:
  test-gui-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: yarn install
      - name: Build packages
        run: yarn build
      - name: Run testing-gui tests
        run: cd tools/testing-gui && yarn test:run
```

## Benefits

1. **Reproducibility**: Issues from Asgardex can be isolated and tested
2. **Test-Driven Fixes**: Every fix comes with a test
3. **Confidence**: Verify fixes work before updating consumers
4. **Documentation**: Issues and fixes are tracked with full context
5. **Automation**: Reduce manual steps in bug fixing workflow
6. **Security**: Dependency audits catch vulnerable packages early
