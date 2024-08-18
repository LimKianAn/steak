import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'blockdaemon/1.0.0 (api/6.1.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * This endpoint allows you to get a list of your staking plans.
   *
   * Staking plans are created by Blockdaemon on your behalf. They are a means to deploy
   * white-label validators or get access to public Blockdaemon validators (depending on the
   * protocol being used in the staking API).
   *
   * If you do not yet have a staking plan, please [contact Blockdaemon
   * sales](https://blockdaemon.com/get-in-touch/) to get started with our industry-leading
   * staking API.
   *
   * @summary List of customer's staking plans
   * @throws FetchError<400, types.ListCustomerPlansResponse400> Invalid request.
   * @throws FetchError<401, types.ListCustomerPlansResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.ListCustomerPlansResponse500> Internal server error.
   */
  listCustomerPlans(metadata: types.ListCustomerPlansMetadataParam): Promise<FetchResponse<200, types.ListCustomerPlansResponse200>> {
    return this.core.fetch('/v1/plans', 'get', metadata);
  }

  /**
   * Retrieve a list of all outstanding stake intents.
   *
   * @summary List Your Stake Intents
   * @throws FetchError<500, types.ListStakeIntentsResponse500> Internal server error.
   */
  listStakeIntents(metadata?: types.ListStakeIntentsMetadataParam): Promise<FetchResponse<200, types.ListStakeIntentsResponse200>> {
    return this.core.fetch('/v1/stake-intents', 'get', metadata);
  }

  /**
   * Reserves one or more available validators and returns an unsigned transaction.
   *
   * The validators will remain reserved for 90 days or until the returned transaction is
   * signed and confirmed in the network. Blockdaemon reserves the right to free any
   * allocated resources if the transaction is not confirmed in time.
   *
   * A single transaction can create up to 250 validators through the use of the Blockdaemon
   * [batch deposit
   * contract](https://gitlab.com/Blockdaemon/open-source/eth2-batch-deposit-contract) which
   * delivers over 50% reduction in gas fees when compared to submitting individual
   * transactions for each deposit.
   *
   * To complete the staking process, you must sign an Ethereum transaction with a [data
   * field](https://ethereum.org/en/developers/docs/transactions/#the-data-field) set to
   * match the returned `unsigned_transaction` property of the response. The `recipient` of
   * the transaction must be set to the `contract_address` property of the response. The
   * account signing the transaction must have the sufficient balance to create the requested
   * number of validators and this amount must be provided as the value of the signed
   * transaction.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostEthereumStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostEthereumStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostEthereumStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostEthereumStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postEthereumStakeIntent(body: types.PostEthereumStakeIntentBodyParam, metadata: types.PostEthereumStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostEthereumStakeIntentResponse200>> {
    return this.core.fetch('/v1/ethereum/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Generates an Ethereum voluntary exit message and broadcasts it to the network.
   *
   * @summary Exit Ethereum Validator
   * @throws FetchError<400, types.ExitEthereumValidatorResponse400> Invalid request.
   * @throws FetchError<401, types.ExitEthereumValidatorResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<404, types.ExitEthereumValidatorResponse404> Validator not found
   * @throws FetchError<500, types.ExitEthereumValidatorResponse500> Internal server error.
   * @throws FetchError<503, types.ExitEthereumValidatorResponse503> Insufficient validators available to process Stake Intent request
   */
  exitEthereumValidator(body: types.ExitEthereumValidatorBodyParam, metadata: types.ExitEthereumValidatorMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/ethereum/{network}/voluntary-exit', 'post', body, metadata);
  }

  /**
   * Generates an Ethereum voluntary exit message and broadcasts it to the network.
   * With most error codes, a list of the correctly processed validators is returned. Use it
   * to check which validators will be exited.
   *
   * @summary Exit Ethereum Validators
   * @throws FetchError<400, types.ExitEthereumValidatorsResponse400> Invalid request.
   * @throws FetchError<401, types.ExitEthereumValidatorsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<404, types.ExitEthereumValidatorsResponse404> Validator not found
   * @throws FetchError<500, types.ExitEthereumValidatorsResponse500> Internal server error.
   * @throws FetchError<503, types.ExitEthereumValidatorsResponse503> Insufficient validators available to process Stake Intent request
   */
  exitEthereumValidators(body: types.ExitEthereumValidatorsBodyParam, metadata: types.ExitEthereumValidatorsMetadataParam): Promise<FetchResponse<200, types.ExitEthereumValidatorsResponse200>> {
    return this.core.fetch('/v1/ethereum/{network}/voluntary-exits', 'post', body, metadata);
  }

  /**
   * Generates a voluntary exit message, but does not broadcast it to the network. Instead,
   * the signed message is returned as part of the response. You can use the Native Ubiquity
   * API for Ethereum to broadcast the message.
   *
   * @summary Generate a Signed Voluntary Exit Message
   * @throws FetchError<400, types.GenerateSignedVoluntaryExitResponse400> Invalid request.
   * @throws FetchError<401, types.GenerateSignedVoluntaryExitResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<404, types.GenerateSignedVoluntaryExitResponse404> validator not found
   * @throws FetchError<500, types.GenerateSignedVoluntaryExitResponse500> Internal server error.
   * @throws FetchError<503, types.GenerateSignedVoluntaryExitResponse503> Insufficient validators available to process Stake Intent request
   */
  generateSignedVoluntaryExit(metadata: types.GenerateSignedVoluntaryExitMetadataParam): Promise<FetchResponse<200, types.GenerateSignedVoluntaryExitResponse200>> {
    return this.core.fetch('/v1/ethereum/{network}/signed-voluntary-exit', 'get', metadata);
  }

  /**
   * Generates an Ethereum Launchpad deposit string for one or more validators. The resulting
   * JSON file will allow you to execute the deposit manually on the official [Ethereum
   * Deposit Launchpad](https://launchpad.ethereum.org/) web-site.
   *
   * @summary Generate an Ethereum Launchpad Deposit File
   * @throws FetchError<400, types.GenerateEthereumLaunchpadDepositResponse400> Invalid request.
   * @throws FetchError<401, types.GenerateEthereumLaunchpadDepositResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<404, types.GenerateEthereumLaunchpadDepositResponse404> validator(s) stake(s) not found
   * @throws FetchError<500, types.GenerateEthereumLaunchpadDepositResponse500> Internal server error.
   * @throws FetchError<503, types.GenerateEthereumLaunchpadDepositResponse503> Insufficient validators available to process Stake Intent request
   */
  generateEthereumLaunchpadDeposit(body: types.GenerateEthereumLaunchpadDepositBodyParam): Promise<FetchResponse<200, types.GenerateEthereumLaunchpadDepositResponse200>> {
    return this.core.fetch('/v1/eth2-launchpad-deposit', 'post', body);
  }

  /**
   * Retrieve Ethereum validator in the pending-queued queue
   *
   * @summary Estimate Ethereum validators progress in the pending-queued queue
   * @throws FetchError<400, types.PendingQueuedProgressResponse400> Invalid request.
   * @throws FetchError<401, types.PendingQueuedProgressResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PendingQueuedProgressResponse500> Internal server error.
   */
  pendingQueuedProgress(body: types.PendingQueuedProgressBodyParam, metadata: types.PendingQueuedProgressMetadataParam): Promise<FetchResponse<200, types.PendingQueuedProgressResponse200>> {
    return this.core.fetch('/v1/ethereum/{network}/queue-progress/pending-queued', 'post', body, metadata);
  }

  /**
   * Retrieve Ethereum validator in the active-exiting queue
   *
   * @summary Estimate Ethereum validators progress in the active-exiting queue
   * @throws FetchError<400, types.ActiveExitingQueueProgressResponse400> Invalid request.
   * @throws FetchError<401, types.ActiveExitingQueueProgressResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.ActiveExitingQueueProgressResponse500> Internal server error.
   */
  activeExitingQueueProgress(body: types.ActiveExitingQueueProgressBodyParam, metadata: types.ActiveExitingQueueProgressMetadataParam): Promise<FetchResponse<200, types.ActiveExitingQueueProgressResponse200>> {
    return this.core.fetch('/v1/ethereum/{network}/queue-progress/active-exiting', 'post', body, metadata);
  }

  /**
   * Returns an unsigned transaction that can be used to delegate your tokens to the
   * validator specified in the request.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostSolanaStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostSolanaStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostSolanaStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostSolanaStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postSolanaStakeIntent(body: types.PostSolanaStakeIntentBodyParam, metadata: types.PostSolanaStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostSolanaStakeIntentResponse200>> {
    return this.core.fetch('/v1/solana/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * This endpoint is used to request deactivation transactions that will be executed against
   * available addresses. The API will automatically select which stake addresses need to be
   * deactivated in order to satisfy the request.
   *
   * This operation may split some of the stakes in order to ensure that the exact amount
   * will be deactivated. If there are not enough available funds, the API will produce an
   * error response.
   *
   * The API returns two sets of transactions – splitting transactions and deactivation
   * transactions. You must sign and broadcast the splitting transactions before the
   * deactivation transactions.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostSolanaDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostSolanaDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostSolanaDeactivationIntentResponse500> Internal server error.
   */
  postSolanaDeactivationIntent(body: types.PostSolanaDeactivationIntentBodyParam, metadata: types.PostSolanaDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostSolanaDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/solana/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding deactivation intents.
   *
   * @summary List Deactivation Intents
   * @throws FetchError<400, types.GetSolanaDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetSolanaDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetSolanaDeactivationIntentsResponse500> Internal server error.
   */
  getSolanaDeactivationIntents(metadata: types.GetSolanaDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetSolanaDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/solana/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Cancels a previously issued deactivation intent by specifying its ID.
   *
   * @summary Cancel Deactivation Intent
   * @throws FetchError<400, types.CancelSolanaDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.CancelSolanaDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.CancelSolanaDeactivationIntentResponse500> Internal server error.
   */
  cancelSolanaDeactivationIntent(body: types.CancelSolanaDeactivationIntentBodyParam, metadata: types.CancelSolanaDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.CancelSolanaDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/solana/{network}/deactivation-intents', 'put', body, metadata);
  }

  /**
   * Returns the total staked amount that can be deactivated across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total deactivatable amount
   * in specific wallets.
   *
   * @summary Get Deactivatable Amount
   * @throws FetchError<400, types.GetSolanaDeactivatableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetSolanaDeactivatableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetSolanaDeactivatableAmountResponse500> Internal server error.
   */
  getSolanaDeactivatableAmount(metadata: types.GetSolanaDeactivatableAmountMetadataParam): Promise<FetchResponse<200, types.GetSolanaDeactivatableAmountResponse200>> {
    return this.core.fetch('/v1/solana/{network}/deactivatable-amount', 'get', metadata);
  }

  /**
   * This endpoint is used to request withdrawal transactions that will be executed against
   * available deactivated accounts. If you request more funds than are currently unlocked,
   * the API will return an error indicating the maximum possible withdrawal.
   *
   * You will receive at least one unsigned transaction (potentially multiple) that needs to
   * be signed in order to complete the withdrawal.
   *
   * @summary Post Withdrawal Intent
   * @throws FetchError<400, types.PostSolanaWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostSolanaWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostSolanaWithdrawalIntentResponse500> Internal server error.
   */
  postSolanaWithdrawalIntent(body: types.PostSolanaWithdrawalIntentBodyParam, metadata: types.PostSolanaWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostSolanaWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/solana/{network}/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding withdrawal intents
   *
   * @summary List Withdrawal Intents
   * @throws FetchError<400, types.GetSolanaWithdrawalIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetSolanaWithdrawalIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetSolanaWithdrawalIntentsResponse500> Internal server error.
   */
  getSolanaWithdrawalIntents(metadata: types.GetSolanaWithdrawalIntentsMetadataParam): Promise<FetchResponse<200, types.GetSolanaWithdrawalIntentsResponse200>> {
    return this.core.fetch('/v1/solana/{network}/withdrawal-intents', 'get', metadata);
  }

  /**
   * Cancels a previously issued withdrawal intent by specifying its ID.
   *
   * @summary Cancel Withdrawal Intent
   * @throws FetchError<400, types.CancelSolanaWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.CancelSolanaWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.CancelSolanaWithdrawalIntentResponse500> Internal server error.
   */
  cancelSolanaWithdrawalIntent(body: types.CancelSolanaWithdrawalIntentBodyParam, metadata: types.CancelSolanaWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.CancelSolanaWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/solana/{network}/withdrawal-intents', 'put', body, metadata);
  }

  /**
   * Returns total amount that can be withdrawn across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total withdrawable amount in
   * specific wallets.
   *
   * @summary Get Withdrawable Amount
   * @throws FetchError<400, types.GetSolanaWithdrawableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetSolanaWithdrawableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetSolanaWithdrawableAmountResponse500> Internal server error.
   */
  getSolanaWithdrawableAmount(metadata: types.GetSolanaWithdrawableAmountMetadataParam): Promise<FetchResponse<200, types.GetSolanaWithdrawableAmountResponse200>> {
    return this.core.fetch('/v1/solana/{network}/withdrawable-amount', 'get', metadata);
  }

  /**
   * Retrieve all of the stake accounts.
   *
   * @summary Get Stake Accounts
   * @throws FetchError<400, types.GetStakeAccountsSolanaResponse400> Invalid request.
   * @throws FetchError<401, types.GetStakeAccountsSolanaResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetStakeAccountsSolanaResponse500> Internal server error.
   */
  getStakeAccountsSolana(metadata: types.GetStakeAccountsSolanaMetadataParam): Promise<FetchResponse<200, types.GetStakeAccountsSolanaResponse200>> {
    return this.core.fetch('/v1/solana/{network}/stake-accounts', 'get', metadata);
  }

  /**
   * Creates a new account bootstrapping intent transaction.
   *
   * Returns an unsigned transaction that sets up the user’s wallet for delegation. It is
   * required to sign and send this transaction only once, the very first time the user is
   * going to delegate. If this step is not completed, any subsequent delegation transactions
   * will fail.
   *
   * @summary Post Bootstrapping Intent
   * @throws FetchError<400, types.PostPolygonBootstrappingIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonBootstrappingIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonBootstrappingIntentResponse500> Internal server error.
   */
  postPolygonBootstrappingIntent(body: types.PostPolygonBootstrappingIntentBodyParam, metadata: types.PostPolygonBootstrappingIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonBootstrappingIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/bootstrapping-intents', 'post', body, metadata);
  }

  /**
   * Returns an unsigned transaction for delegation. Before using this endpoint, the user
   * must sign and submit the unsigned transaction returned by [Post Bootstrapping
   * Intent](https://docs.blockdaemon.com/reference/postpolygonbootstrappingintent).
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostPolygonStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostPolygonStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postPolygonStakeIntent(body: types.PostPolygonStakeIntentBodyParam, metadata: types.PostPolygonStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonStakeIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Creates a new unbond intent that opts out of the delegation program.
   * The user is getting back both their stake and the earned reward. The reward is sent
   * immediately, but the stake gets locked for the so-called “unbonding period” of 2–3 days
   * (or 80 Polygon checkpoints). Once the period is over, the user should call [GET
   * Deactivation
   * Intents](https://docs.blockdaemon.com/reference/getpolygondeactivationintents) and [POST
   * Withdrawal Intent](https://docs.blockdaemon.com/reference/postpolygonwithdrawalintent)
   * to actually get their stake back.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostPolygonDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonDeactivationIntentResponse500> Internal server error.
   */
  postPolygonDeactivationIntent(body: types.PostPolygonDeactivationIntentBodyParam, metadata: types.PostPolygonDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Returns deactivation requests (only unclaimed stakes) for a **given wallet address**.
   *
   * Deactivation requests are stored in the blockchain and provide the user with an unbond
   * nonce for each. Nonces are used to unstake (withdraw) your MATIC tokens wit [Post
   * Withdrawal Intent](https://docs.blockdaemon.com/reference/postpolygonwithdrawalintent).
   *
   * @summary Lists Deactivation Intents
   * @throws FetchError<400, types.GetPolygonDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetPolygonDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetPolygonDeactivationIntentsResponse500> Internal server error.
   */
  getPolygonDeactivationIntents(metadata: types.GetPolygonDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetPolygonDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Cancels a previously issued deactivation intent by specifying its ID.
   *
   * @summary Cancel Deactivation Intent
   * @throws FetchError<400, types.CancelPolygonDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.CancelPolygonDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.CancelPolygonDeactivationIntentResponse500> Internal server error.
   */
  cancelPolygonDeactivationIntent(body: types.CancelPolygonDeactivationIntentBodyParam, metadata: types.CancelPolygonDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.CancelPolygonDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/deactivation-intents', 'put', body, metadata);
  }

  /**
   * Creates a new unstake intent to fully withdraw a stake. It should be used only after the
   * unbonding period has passed. If no unbond nonce is specified, transactions for all
   * available unstakes will be returned.
   * Nonces are returned by [List Deactivation
   * Intents](https://docs.blockdaemon.com/reference/getpolygondeactivationintents).
   *
   * @summary Post Withdrawal Intent
   * @throws FetchError<400, types.PostPolygonWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonWithdrawalIntentResponse500> Internal server error.
   */
  postPolygonWithdrawalIntent(body: types.PostPolygonWithdrawalIntentBodyParam, metadata: types.PostPolygonWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Creates a new restake intent that restakes token rewards to the validator and increases
   * the delegation stake.
   *
   * @summary Post Rewards Restake Intent
   * @throws FetchError<400, types.PostPolygonRewardsRestakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonRewardsRestakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonRewardsRestakeIntentResponse500> Internal server error.
   */
  postPolygonRewardsRestakeIntent(body: types.PostPolygonRewardsRestakeIntentBodyParam, metadata: types.PostPolygonRewardsRestakeIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonRewardsRestakeIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/rewards/restake-intents', 'post', body, metadata);
  }

  /**
   * Creates a new withdrawal intent that withdraws only the accumulated rewards. Staked
   * tokens stay untouched and keep earning rewards.
   *
   * @summary Post Rewards Withdrawal Intent
   * @throws FetchError<400, types.PostPolygonRewardsWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolygonRewardsWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolygonRewardsWithdrawalIntentResponse500> Internal server error.
   */
  postPolygonRewardsWithdrawalIntent(body: types.PostPolygonRewardsWithdrawalIntentBodyParam, metadata: types.PostPolygonRewardsWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostPolygonRewardsWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/polygon/{network}/rewards/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Creates an unsigned transaction that will attach a Blockdaemon's proxy account to the
   * specified customer account. This will allow Blockdaemon to nominate on behalf of the
   * customer and to continuously optimise the nominations of the customer account in order
   * to achieve the best possible rewards.
   *
   * The attaching will take place as soon as the user signs and broadcasts the transaction
   * to the Polkadot network.
   *
   * The customer account can be a stash account or a proxy (staking or non-transfer) for a
   * stash account.
   *
   * **Example (for the Westend network):** - Submitted:
   *     - customer_address: 5CF33r36TUbcSz4KxXo5ApzAW9Dtf8EkfvTQppiEEd9HfAZ6
   * - Returned:
   *     - proxy_address: 5FEPMjDLQd4Yyf8Dg7WSNVWSU36T1rXCcq1ph6HkW1YpNs5e
   *     - unsigned_transaction:
   * 0xa4041601008c16e19e94328985d65cb7e3245213892730dd0e841f6511478cb12f23a178330100000000
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostPolkadotStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolkadotStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolkadotStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostPolkadotStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postPolkadotStakeIntent(body: types.PostPolkadotStakeIntentBodyParam, metadata: types.PostPolkadotStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostPolkadotStakeIntentResponse200>> {
    return this.core.fetch('/v1/polkadot/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Returns an unsigned transaction to deactivate a certain amount of stake.
   *
   * The transaction will remove the specified amount from the staked amount. If an amount is
   * not specified, the default is all staked amount. This will take place as soon as the
   * user signs and broadcasts the transaction to the Polkadot network.
   *
   * Please note that this amount will remain in the "staking" section of the account - it
   * can be staked elsewhere, but cannot be transferred freely to another account. To move it
   * to the "general" section of the account, the user will need to also create an withdrawal
   * request.
   *
   * If the amount is all of the stake controlled by this customer account ("full
   * deactivation"), the transaction will also disconnect the Blockdaemon proxy account from
   * this customer account. Please note that in this case all existing nominations of the
   * customer account will remain active. Blockdaemon will immediately cease the further
   * management of nominations even if the deactivation transaction is not broadcasted by the
   * user to the network.
   *
   * **Full deactivation example (for the Westend network):** - Submitted:
   *     - customer_address: 5CF33r36TUbcSz4KxXo5ApzAW9Dtf8EkfvTQppiEEd9HfAZ6
   *     - amount: (not specified)
   * - Returned:
   *     - proxy_address: 5FEPMjDLQd4Yyf8Dg7WSNVWSU36T1rXCcq1ph6HkW1YpNs5e
   *     - unsigned_transaction:
   * 0xd00410020c0606060202286bee1602008c16e19e94328985d65cb7e3245213892730dd0e841f6511478cb12f23a178330100000000
   *
   *
   * If the amount is less than all of the stake controlled by this customer account
   * ("partial nomination"), this amount will be deactivated, but the Blockdaemon proxy
   * account will not be disconnected from the customer account, and will continue to manage
   * its nominations.
   *
   * **Partial deactivation example (for the Westend network):** - Submitted:
   *     - customer_address: 5CF33r36TUbcSz4KxXo5ApzAW9Dtf8EkfvTQppiEEd9HfAZ6
   *     - amount: 1,000,000,000
   * - Returned:
   *     - proxy_address: 5FEPMjDLQd4Yyf8Dg7WSNVWSU36T1rXCcq1ph6HkW1YpNs5e
   *     - unsigned_transaction: 0x30041002080606060202286bee
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostPolkadotDeactivateIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolkadotDeactivateIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolkadotDeactivateIntentResponse500> Internal server error.
   */
  postPolkadotDeactivateIntent(body: types.PostPolkadotDeactivateIntentBodyParam, metadata: types.PostPolkadotDeactivateIntentMetadataParam): Promise<FetchResponse<200, types.PostPolkadotDeactivateIntentResponse200>> {
    return this.core.fetch('/v1/polkadot/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Returns an unsigned transaction to move the free (currently not staked) amount of DOT in
   * the "staking" section of this account to its "general" section.
   *
   * The withdrawal will take place as soon as the user signs and broadcasts the transaction
   * to the Polkadot network.
   *
   * Explanation: Some or all of the stake in the "staking" section might not be nominated
   * (likely was deactivated through a Deactivation Intent). This amount can be nominated to
   * some validator(s), but cannot be transferred to another account (spent). To be free for
   * that, this amount must be moved to the "general" section of the account.
   *
   * The customer account used can be a stash account or a proxy (staking or non-transfer)
   * for a stash account.
   *
   * **Example (for the Westend network):** - Submitted:
   *     - customer_address: 5CF33r36TUbcSz4KxXo5ApzAW9Dtf8EkfvTQppiEEd9HfAZ6
   * - Returned:
   *     - customer_address: 5CF33r36TUbcSz4KxXo5ApzAW9Dtf8EkfvTQppiEEd9HfAZ6
   *     - unsigned_transaction: 0x1c04060301000000
   *
   * @summary Post Withdrawal Intent
   * @throws FetchError<400, types.PostPolkadotWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostPolkadotWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostPolkadotWithdrawalIntentResponse500> Internal server error.
   */
  postPolkadotWithdrawalIntent(body: types.PostPolkadotWithdrawalIntentBodyParam, metadata: types.PostPolkadotWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostPolkadotWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/polkadot/{network}/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Blockdaemon reserves the right to free any allocated resources if the transaction is not
   * confirmed in time.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostCosmosStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCosmosStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCosmosStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostCosmosStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postCosmosStakeIntent(body: types.PostCosmosStakeIntentBodyParam, metadata: types.PostCosmosStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostCosmosStakeIntentResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Create transaction to undelegate given amount of ATOMs from a validator.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostCosmosDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCosmosDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCosmosDeactivationIntentResponse500> Internal server error.
   */
  postCosmosDeactivationIntent(body: types.PostCosmosDeactivationIntentBodyParam, metadata: types.PostCosmosDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostCosmosDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of deactivation intents.
   *
   * @summary Lists Deactivation Intents
   * @throws FetchError<400, types.GetCosmosDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetCosmosDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCosmosDeactivationIntentsResponse500> Internal server error.
   */
  getCosmosDeactivationIntents(metadata: types.GetCosmosDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetCosmosDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Creates a new withdrawal intent that withdraws only the accumulated rewards. Staked
   * tokens stay untouched and keep earning rewards.
   *
   * @summary Post Rewards Withdrawal Intent
   * @throws FetchError<400, types.PostCosmosRewardsWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCosmosRewardsWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCosmosRewardsWithdrawalIntentResponse500> Internal server error.
   */
  postCosmosRewardsWithdrawalIntent(body: types.PostCosmosRewardsWithdrawalIntentBodyParam, metadata: types.PostCosmosRewardsWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostCosmosRewardsWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/rewards/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Returns the total staked amount that can be deactivated across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total deactivatable amount
   * in specific wallets.
   *
   * @summary Get Deactivatable Amount
   * @throws FetchError<400, types.GetCosmosDeactivatableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetCosmosDeactivatableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCosmosDeactivatableAmountResponse500> Internal server error.
   */
  getCosmosDeactivatableAmount(metadata: types.GetCosmosDeactivatableAmountMetadataParam): Promise<FetchResponse<200, types.GetCosmosDeactivatableAmountResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/deactivatable-amount', 'get', metadata);
  }

  /**
   * Returns the total accumulated rewards amount that can be withdrawn across all wallets of
   * the user.
   *
   * You can specify the optional `wallets` parameter to get the total accumulated rewards
   * amount in specific wallets.
   *
   * @summary Get Withdrawable Rewards Amount
   * @throws FetchError<400, types.GetCosmosWithdrawableRewardsAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetCosmosWithdrawableRewardsAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCosmosWithdrawableRewardsAmountResponse500> Internal server error.
   */
  getCosmosWithdrawableRewardsAmount(metadata: types.GetCosmosWithdrawableRewardsAmountMetadataParam): Promise<FetchResponse<200, types.GetCosmosWithdrawableRewardsAmountResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/rewards/withdrawable-amount', 'get', metadata);
  }

  /**
   * Create transaction to move given amount of ATOMs from one validator to another.
   *
   * @summary Post restake Intent
   * @throws FetchError<400, types.PostCosmosRestakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCosmosRestakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCosmosRestakeIntentResponse500> Internal server error.
   */
  postCosmosRestakeIntent(body: types.PostCosmosRestakeIntentBodyParam, metadata: types.PostCosmosRestakeIntentMetadataParam): Promise<FetchResponse<201, types.PostCosmosRestakeIntentResponse201>> {
    return this.core.fetch('/v1/cosmos/{network}/restake-intents', 'post', body, metadata);
  }

  /**
   * List restake intents
   *
   * @summary Lists Restake Intents
   * @throws FetchError<400, types.GetCosmosRestakeIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetCosmosRestakeIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCosmosRestakeIntentsResponse500> Internal server error.
   */
  getCosmosRestakeIntents(metadata: types.GetCosmosRestakeIntentsMetadataParam): Promise<FetchResponse<200, types.GetCosmosRestakeIntentsResponse200>> {
    return this.core.fetch('/v1/cosmos/{network}/restake-intents', 'get', metadata);
  }

  /**
   * Blockdaemon reserves the right to free any allocated resources if the transaction is not
   * confirmed in time.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostBinanceStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostBinanceStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostBinanceStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostBinanceStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postBinanceStakeIntent(body: types.PostBinanceStakeIntentBodyParam, metadata: types.PostBinanceStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostBinanceStakeIntentResponse200>> {
    return this.core.fetch('/v1/binance/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Create transaction to undelegate given amount of BNB from a validator.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostBinanceDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostBinanceDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostBinanceDeactivationIntentResponse500> Internal server error.
   */
  postBinanceDeactivationIntent(body: types.PostBinanceDeactivationIntentBodyParam, metadata: types.PostBinanceDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostBinanceDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/binance/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of deactivation intents.
   *
   * @summary Lists Deactivation Intents
   * @throws FetchError<400, types.GetBinanceDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetBinanceDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetBinanceDeactivationIntentsResponse500> Internal server error.
   */
  getBinanceDeactivationIntents(metadata: types.GetBinanceDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetBinanceDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/binance/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Returns the total staked amount that can be deactivated across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total deactivatable amount
   * in specific wallets.
   *
   * @summary Get Deactivatable Amount
   * @throws FetchError<400, types.GetBinanceDeactivatableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetBinanceDeactivatableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetBinanceDeactivatableAmountResponse500> Internal server error.
   */
  getBinanceDeactivatableAmount(metadata: types.GetBinanceDeactivatableAmountMetadataParam): Promise<FetchResponse<200, types.GetBinanceDeactivatableAmountResponse200>> {
    return this.core.fetch('/v1/binance/{network}/deactivatable-amount', 'get', metadata);
  }

  /**
   * Create transaction to move given amount of ATOMs from one validator to another.
   *
   * @summary Post restake Intent
   * @throws FetchError<400, types.PostBinanceRestakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostBinanceRestakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostBinanceRestakeIntentResponse500> Internal server error.
   */
  postBinanceRestakeIntent(body: types.PostBinanceRestakeIntentBodyParam, metadata: types.PostBinanceRestakeIntentMetadataParam): Promise<FetchResponse<201, types.PostBinanceRestakeIntentResponse201>> {
    return this.core.fetch('/v1/binance/{network}/restake-intents', 'post', body, metadata);
  }

  /**
   * List restake intents
   *
   * @summary Lists Restake Intents
   * @throws FetchError<400, types.GetBinanceRestakeIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetBinanceRestakeIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetBinanceRestakeIntentsResponse500> Internal server error.
   */
  getBinanceRestakeIntents(metadata: types.GetBinanceRestakeIntentsMetadataParam): Promise<FetchResponse<200, types.GetBinanceRestakeIntentsResponse200>> {
    return this.core.fetch('/v1/binance/{network}/restake-intents', 'get', metadata);
  }

  /**
   * Returns an unsigned transaction that can be used to delegate your tokens to a
   * Blockdaemon validator.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostNearStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostNearStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostNearStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostNearStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postNearStakeIntent(body: types.PostNearStakeIntentBodyParam, metadata: types.PostNearStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostNearStakeIntentResponse200>> {
    return this.core.fetch('/v1/near/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Create a transaction for deactivating staked NEAR tokens.
   *
   * The Post Deactivation Intent endpoint returns an unsigned transaction, which once signed
   * and broadcasted starts the deactivation process. The process will complete in 4 NEAR
   * epochs (48 hours).
   *
   * Once the deactivation countdown is underway, you can still change the deactivated
   * account by generating and broadcasting a new deactivation transaction. Please note that
   * this will reset the countdown.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostNearDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostNearDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostNearDeactivationIntentResponse500> Internal server error.
   */
  postNearDeactivationIntent(body: types.PostNearDeactivationIntentBodyParam, metadata: types.PostNearDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostNearDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/near/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding deactivation intents.
   *
   * @summary List Deactivation Intents
   * @throws FetchError<400, types.GetNearDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetNearDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetNearDeactivationIntentsResponse500> Internal server error.
   */
  getNearDeactivationIntents(metadata: types.GetNearDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetNearDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/near/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Cancels a previously issued deactivation intent by specifying its ID.
   *
   * @summary Cancel Deactivation Intent
   * @throws FetchError<400, types.CancelNearDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.CancelNearDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.CancelNearDeactivationIntentResponse500> Internal server error.
   */
  cancelNearDeactivationIntent(body: types.CancelNearDeactivationIntentBodyParam, metadata: types.CancelNearDeactivationIntentMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/v1/near/{network}/deactivation-intents', 'put', body, metadata);
  }

  /**
   * Returns the total staked amount that can be deactivated across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total deactivatable amount
   * in specific wallets.
   *
   * @summary Get Deactivatable Amount
   * @throws FetchError<400, types.GetNearDeactivatableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetNearDeactivatableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetNearDeactivatableAmountResponse500> Internal server error.
   */
  getNearDeactivatableAmount(metadata: types.GetNearDeactivatableAmountMetadataParam): Promise<FetchResponse<200, types.GetNearDeactivatableAmountResponse200>> {
    return this.core.fetch('/v1/near/{network}/deactivatable-amount', 'get', metadata);
  }

  /**
   * Returns an unsigned transaction that can be used to withdraw your stake after it was
   * deactivated through the [Post Deactivation
   * Intent](https://docs.blockdaemon.com/reference/postneardeactivationintent) endpoint.
   *
   * @summary Post Withdrawal Intent
   * @throws FetchError<400, types.PostNearWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostNearWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostNearWithdrawalIntentResponse500> Internal server error.
   */
  postNearWithdrawalIntent(body: types.PostNearWithdrawalIntentBodyParam, metadata: types.PostNearWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostNearWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/near/{network}/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding withdrawal intents.
   *
   * @summary List Withdrawal Intents
   * @throws FetchError<400, types.GetNearWithdrawalIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetNearWithdrawalIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetNearWithdrawalIntentsResponse500> Internal server error.
   */
  getNearWithdrawalIntents(metadata: types.GetNearWithdrawalIntentsMetadataParam): Promise<FetchResponse<200, types.GetNearWithdrawalIntentsResponse200>> {
    return this.core.fetch('/v1/near/{network}/withdrawal-intents', 'get', metadata);
  }

  /**
   * Returns total amount that can be withdrawn across all wallets of the user.
   *
   * You can specify the optional `wallets` parameter to get the total withdrawable amount in
   * specific wallets.
   *
   * @summary Get Withdrawable Amount
   * @throws FetchError<400, types.GetNearWithdrawableAmountResponse400> Invalid request.
   * @throws FetchError<401, types.GetNearWithdrawableAmountResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetNearWithdrawableAmountResponse500> Internal server error.
   */
  getNearWithdrawableAmount(metadata: types.GetNearWithdrawableAmountMetadataParam): Promise<FetchResponse<200, types.GetNearWithdrawableAmountResponse200>> {
    return this.core.fetch('/v1/near/{network}/withdrawable-amount', 'get', metadata);
  }

  /**
   * Return an unsigned transaction that can be used to stake your tokens with the
   * Blockdaemon staking pool.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostCardanoStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCardanoStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCardanoStakeIntentResponse500> Internal server error.
   * @throws FetchError<503, types.PostCardanoStakeIntentResponse503> Insufficient validators available to process Stake Intent request
   */
  postCardanoStakeIntent(body: types.PostCardanoStakeIntentBodyParam, metadata: types.PostCardanoStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostCardanoStakeIntentResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/stake-intents', 'post', body, metadata);
  }

  /**
   * Create a transaction for deactivating staked Cardano tokens.
   *
   * @summary Post Deactivation Intent
   * @throws FetchError<400, types.PostCardanoDeactivationIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCardanoDeactivationIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCardanoDeactivationIntentResponse500> Internal server error.
   */
  postCardanoDeactivationIntent(body: types.PostCardanoDeactivationIntentBodyParam, metadata: types.PostCardanoDeactivationIntentMetadataParam): Promise<FetchResponse<200, types.PostCardanoDeactivationIntentResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/deactivation-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding deactivation intents.
   *
   * @summary List Deactivation Intents
   * @throws FetchError<400, types.GetCardanoDeactivationIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetCardanoDeactivationIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCardanoDeactivationIntentsResponse500> Internal server error.
   */
  getCardanoDeactivationIntents(metadata: types.GetCardanoDeactivationIntentsMetadataParam): Promise<FetchResponse<200, types.GetCardanoDeactivationIntentsResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/deactivation-intents', 'get', metadata);
  }

  /**
   * Creates a new withdrawal intent that withdraws only the accumulated rewards. Staked
   * tokens stay untouched and keep earning rewards.
   *
   * @summary Post Rewards Withdrawal Intent
   * @throws FetchError<400, types.PostCardanoRewardsWithdrawalIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostCardanoRewardsWithdrawalIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostCardanoRewardsWithdrawalIntentResponse500> Internal server error.
   */
  postCardanoRewardsWithdrawalIntent(body: types.PostCardanoRewardsWithdrawalIntentBodyParam, metadata: types.PostCardanoRewardsWithdrawalIntentMetadataParam): Promise<FetchResponse<200, types.PostCardanoRewardsWithdrawalIntentResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/rewards/withdrawal-intents', 'post', body, metadata);
  }

  /**
   * Retrieve a list of all outstanding rewards withdrawal intents.
   *
   * @summary List Rewards Withdrawal Intents
   * @throws FetchError<400, types.GetCardanoRewardsWithdrawalIntentsResponse400> Invalid request.
   * @throws FetchError<401, types.GetCardanoRewardsWithdrawalIntentsResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.GetCardanoRewardsWithdrawalIntentsResponse500> Internal server error.
   */
  getCardanoRewardsWithdrawalIntents(metadata: types.GetCardanoRewardsWithdrawalIntentsMetadataParam): Promise<FetchResponse<200, types.GetCardanoRewardsWithdrawalIntentsResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/rewards/withdrawal-intents', 'get', metadata);
  }

  /**
   * Submits a signed transaction to the Cardano network.
   *
   * @summary Broadcast Transaction
   * @throws FetchError<400, types.SubmitTransactionResponse400> Invalid request.
   * @throws FetchError<401, types.SubmitTransactionResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.SubmitTransactionResponse500> Internal server error.
   * @throws FetchError<503, types.SubmitTransactionResponse503> Insufficient validators available to process Stake Intent request
   */
  submitTransaction(body: types.SubmitTransactionBodyParam, metadata: types.SubmitTransactionMetadataParam): Promise<FetchResponse<200, types.SubmitTransactionResponse200>> {
    return this.core.fetch('/v1/cardano/{network}/transaction-submission', 'post', body, metadata);
  }

  /**
   * Returns an unsigned transaction that can be used to delegate your tokens to a
   * Blockdaemon validator.
   *
   * @summary Post Stake Intent
   * @throws FetchError<400, types.PostAvaxStakeIntentResponse400> Invalid request.
   * @throws FetchError<401, types.PostAvaxStakeIntentResponse401> Header 'X-API-Key' missing.
   * @throws FetchError<500, types.PostAvaxStakeIntentResponse500> Internal server error.
   */
  postAvaxStakeIntent(body: types.PostAvaxStakeIntentBodyParam, metadata: types.PostAvaxStakeIntentMetadataParam): Promise<FetchResponse<200, types.PostAvaxStakeIntentResponse200>> {
    return this.core.fetch('/v1/avalanche/{network}/stake-intents', 'post', body, metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { ActiveExitingQueueProgressBodyParam, ActiveExitingQueueProgressMetadataParam, ActiveExitingQueueProgressResponse200, ActiveExitingQueueProgressResponse400, ActiveExitingQueueProgressResponse401, ActiveExitingQueueProgressResponse500, CancelNearDeactivationIntentBodyParam, CancelNearDeactivationIntentMetadataParam, CancelNearDeactivationIntentResponse400, CancelNearDeactivationIntentResponse401, CancelNearDeactivationIntentResponse500, CancelPolygonDeactivationIntentBodyParam, CancelPolygonDeactivationIntentMetadataParam, CancelPolygonDeactivationIntentResponse200, CancelPolygonDeactivationIntentResponse400, CancelPolygonDeactivationIntentResponse401, CancelPolygonDeactivationIntentResponse500, CancelSolanaDeactivationIntentBodyParam, CancelSolanaDeactivationIntentMetadataParam, CancelSolanaDeactivationIntentResponse200, CancelSolanaDeactivationIntentResponse400, CancelSolanaDeactivationIntentResponse401, CancelSolanaDeactivationIntentResponse500, CancelSolanaWithdrawalIntentBodyParam, CancelSolanaWithdrawalIntentMetadataParam, CancelSolanaWithdrawalIntentResponse200, CancelSolanaWithdrawalIntentResponse400, CancelSolanaWithdrawalIntentResponse401, CancelSolanaWithdrawalIntentResponse500, ExitEthereumValidatorBodyParam, ExitEthereumValidatorMetadataParam, ExitEthereumValidatorResponse400, ExitEthereumValidatorResponse401, ExitEthereumValidatorResponse404, ExitEthereumValidatorResponse500, ExitEthereumValidatorResponse503, ExitEthereumValidatorsBodyParam, ExitEthereumValidatorsMetadataParam, ExitEthereumValidatorsResponse200, ExitEthereumValidatorsResponse400, ExitEthereumValidatorsResponse401, ExitEthereumValidatorsResponse404, ExitEthereumValidatorsResponse500, ExitEthereumValidatorsResponse503, GenerateEthereumLaunchpadDepositBodyParam, GenerateEthereumLaunchpadDepositResponse200, GenerateEthereumLaunchpadDepositResponse400, GenerateEthereumLaunchpadDepositResponse401, GenerateEthereumLaunchpadDepositResponse404, GenerateEthereumLaunchpadDepositResponse500, GenerateEthereumLaunchpadDepositResponse503, GenerateSignedVoluntaryExitMetadataParam, GenerateSignedVoluntaryExitResponse200, GenerateSignedVoluntaryExitResponse400, GenerateSignedVoluntaryExitResponse401, GenerateSignedVoluntaryExitResponse404, GenerateSignedVoluntaryExitResponse500, GenerateSignedVoluntaryExitResponse503, GetBinanceDeactivatableAmountMetadataParam, GetBinanceDeactivatableAmountResponse200, GetBinanceDeactivatableAmountResponse400, GetBinanceDeactivatableAmountResponse401, GetBinanceDeactivatableAmountResponse500, GetBinanceDeactivationIntentsMetadataParam, GetBinanceDeactivationIntentsResponse200, GetBinanceDeactivationIntentsResponse400, GetBinanceDeactivationIntentsResponse401, GetBinanceDeactivationIntentsResponse500, GetBinanceRestakeIntentsMetadataParam, GetBinanceRestakeIntentsResponse200, GetBinanceRestakeIntentsResponse400, GetBinanceRestakeIntentsResponse401, GetBinanceRestakeIntentsResponse500, GetCardanoDeactivationIntentsMetadataParam, GetCardanoDeactivationIntentsResponse200, GetCardanoDeactivationIntentsResponse400, GetCardanoDeactivationIntentsResponse401, GetCardanoDeactivationIntentsResponse500, GetCardanoRewardsWithdrawalIntentsMetadataParam, GetCardanoRewardsWithdrawalIntentsResponse200, GetCardanoRewardsWithdrawalIntentsResponse400, GetCardanoRewardsWithdrawalIntentsResponse401, GetCardanoRewardsWithdrawalIntentsResponse500, GetCosmosDeactivatableAmountMetadataParam, GetCosmosDeactivatableAmountResponse200, GetCosmosDeactivatableAmountResponse400, GetCosmosDeactivatableAmountResponse401, GetCosmosDeactivatableAmountResponse500, GetCosmosDeactivationIntentsMetadataParam, GetCosmosDeactivationIntentsResponse200, GetCosmosDeactivationIntentsResponse400, GetCosmosDeactivationIntentsResponse401, GetCosmosDeactivationIntentsResponse500, GetCosmosRestakeIntentsMetadataParam, GetCosmosRestakeIntentsResponse200, GetCosmosRestakeIntentsResponse400, GetCosmosRestakeIntentsResponse401, GetCosmosRestakeIntentsResponse500, GetCosmosWithdrawableRewardsAmountMetadataParam, GetCosmosWithdrawableRewardsAmountResponse200, GetCosmosWithdrawableRewardsAmountResponse400, GetCosmosWithdrawableRewardsAmountResponse401, GetCosmosWithdrawableRewardsAmountResponse500, GetNearDeactivatableAmountMetadataParam, GetNearDeactivatableAmountResponse200, GetNearDeactivatableAmountResponse400, GetNearDeactivatableAmountResponse401, GetNearDeactivatableAmountResponse500, GetNearDeactivationIntentsMetadataParam, GetNearDeactivationIntentsResponse200, GetNearDeactivationIntentsResponse400, GetNearDeactivationIntentsResponse401, GetNearDeactivationIntentsResponse500, GetNearWithdrawableAmountMetadataParam, GetNearWithdrawableAmountResponse200, GetNearWithdrawableAmountResponse400, GetNearWithdrawableAmountResponse401, GetNearWithdrawableAmountResponse500, GetNearWithdrawalIntentsMetadataParam, GetNearWithdrawalIntentsResponse200, GetNearWithdrawalIntentsResponse400, GetNearWithdrawalIntentsResponse401, GetNearWithdrawalIntentsResponse500, GetPolygonDeactivationIntentsMetadataParam, GetPolygonDeactivationIntentsResponse200, GetPolygonDeactivationIntentsResponse400, GetPolygonDeactivationIntentsResponse401, GetPolygonDeactivationIntentsResponse500, GetSolanaDeactivatableAmountMetadataParam, GetSolanaDeactivatableAmountResponse200, GetSolanaDeactivatableAmountResponse400, GetSolanaDeactivatableAmountResponse401, GetSolanaDeactivatableAmountResponse500, GetSolanaDeactivationIntentsMetadataParam, GetSolanaDeactivationIntentsResponse200, GetSolanaDeactivationIntentsResponse400, GetSolanaDeactivationIntentsResponse401, GetSolanaDeactivationIntentsResponse500, GetSolanaWithdrawableAmountMetadataParam, GetSolanaWithdrawableAmountResponse200, GetSolanaWithdrawableAmountResponse400, GetSolanaWithdrawableAmountResponse401, GetSolanaWithdrawableAmountResponse500, GetSolanaWithdrawalIntentsMetadataParam, GetSolanaWithdrawalIntentsResponse200, GetSolanaWithdrawalIntentsResponse400, GetSolanaWithdrawalIntentsResponse401, GetSolanaWithdrawalIntentsResponse500, GetStakeAccountsSolanaMetadataParam, GetStakeAccountsSolanaResponse200, GetStakeAccountsSolanaResponse400, GetStakeAccountsSolanaResponse401, GetStakeAccountsSolanaResponse500, ListCustomerPlansMetadataParam, ListCustomerPlansResponse200, ListCustomerPlansResponse400, ListCustomerPlansResponse401, ListCustomerPlansResponse500, ListStakeIntentsMetadataParam, ListStakeIntentsResponse200, ListStakeIntentsResponse500, PendingQueuedProgressBodyParam, PendingQueuedProgressMetadataParam, PendingQueuedProgressResponse200, PendingQueuedProgressResponse400, PendingQueuedProgressResponse401, PendingQueuedProgressResponse500, PostAvaxStakeIntentBodyParam, PostAvaxStakeIntentMetadataParam, PostAvaxStakeIntentResponse200, PostAvaxStakeIntentResponse400, PostAvaxStakeIntentResponse401, PostAvaxStakeIntentResponse500, PostBinanceDeactivationIntentBodyParam, PostBinanceDeactivationIntentMetadataParam, PostBinanceDeactivationIntentResponse200, PostBinanceDeactivationIntentResponse400, PostBinanceDeactivationIntentResponse401, PostBinanceDeactivationIntentResponse500, PostBinanceRestakeIntentBodyParam, PostBinanceRestakeIntentMetadataParam, PostBinanceRestakeIntentResponse201, PostBinanceRestakeIntentResponse400, PostBinanceRestakeIntentResponse401, PostBinanceRestakeIntentResponse500, PostBinanceStakeIntentBodyParam, PostBinanceStakeIntentMetadataParam, PostBinanceStakeIntentResponse200, PostBinanceStakeIntentResponse400, PostBinanceStakeIntentResponse401, PostBinanceStakeIntentResponse500, PostBinanceStakeIntentResponse503, PostCardanoDeactivationIntentBodyParam, PostCardanoDeactivationIntentMetadataParam, PostCardanoDeactivationIntentResponse200, PostCardanoDeactivationIntentResponse400, PostCardanoDeactivationIntentResponse401, PostCardanoDeactivationIntentResponse500, PostCardanoRewardsWithdrawalIntentBodyParam, PostCardanoRewardsWithdrawalIntentMetadataParam, PostCardanoRewardsWithdrawalIntentResponse200, PostCardanoRewardsWithdrawalIntentResponse400, PostCardanoRewardsWithdrawalIntentResponse401, PostCardanoRewardsWithdrawalIntentResponse500, PostCardanoStakeIntentBodyParam, PostCardanoStakeIntentMetadataParam, PostCardanoStakeIntentResponse200, PostCardanoStakeIntentResponse400, PostCardanoStakeIntentResponse401, PostCardanoStakeIntentResponse500, PostCardanoStakeIntentResponse503, PostCosmosDeactivationIntentBodyParam, PostCosmosDeactivationIntentMetadataParam, PostCosmosDeactivationIntentResponse200, PostCosmosDeactivationIntentResponse400, PostCosmosDeactivationIntentResponse401, PostCosmosDeactivationIntentResponse500, PostCosmosRestakeIntentBodyParam, PostCosmosRestakeIntentMetadataParam, PostCosmosRestakeIntentResponse201, PostCosmosRestakeIntentResponse400, PostCosmosRestakeIntentResponse401, PostCosmosRestakeIntentResponse500, PostCosmosRewardsWithdrawalIntentBodyParam, PostCosmosRewardsWithdrawalIntentMetadataParam, PostCosmosRewardsWithdrawalIntentResponse200, PostCosmosRewardsWithdrawalIntentResponse400, PostCosmosRewardsWithdrawalIntentResponse401, PostCosmosRewardsWithdrawalIntentResponse500, PostCosmosStakeIntentBodyParam, PostCosmosStakeIntentMetadataParam, PostCosmosStakeIntentResponse200, PostCosmosStakeIntentResponse400, PostCosmosStakeIntentResponse401, PostCosmosStakeIntentResponse500, PostCosmosStakeIntentResponse503, PostEthereumStakeIntentBodyParam, PostEthereumStakeIntentMetadataParam, PostEthereumStakeIntentResponse200, PostEthereumStakeIntentResponse400, PostEthereumStakeIntentResponse401, PostEthereumStakeIntentResponse500, PostEthereumStakeIntentResponse503, PostNearDeactivationIntentBodyParam, PostNearDeactivationIntentMetadataParam, PostNearDeactivationIntentResponse200, PostNearDeactivationIntentResponse400, PostNearDeactivationIntentResponse401, PostNearDeactivationIntentResponse500, PostNearStakeIntentBodyParam, PostNearStakeIntentMetadataParam, PostNearStakeIntentResponse200, PostNearStakeIntentResponse400, PostNearStakeIntentResponse401, PostNearStakeIntentResponse500, PostNearStakeIntentResponse503, PostNearWithdrawalIntentBodyParam, PostNearWithdrawalIntentMetadataParam, PostNearWithdrawalIntentResponse200, PostNearWithdrawalIntentResponse400, PostNearWithdrawalIntentResponse401, PostNearWithdrawalIntentResponse500, PostPolkadotDeactivateIntentBodyParam, PostPolkadotDeactivateIntentMetadataParam, PostPolkadotDeactivateIntentResponse200, PostPolkadotDeactivateIntentResponse400, PostPolkadotDeactivateIntentResponse401, PostPolkadotDeactivateIntentResponse500, PostPolkadotStakeIntentBodyParam, PostPolkadotStakeIntentMetadataParam, PostPolkadotStakeIntentResponse200, PostPolkadotStakeIntentResponse400, PostPolkadotStakeIntentResponse401, PostPolkadotStakeIntentResponse500, PostPolkadotStakeIntentResponse503, PostPolkadotWithdrawalIntentBodyParam, PostPolkadotWithdrawalIntentMetadataParam, PostPolkadotWithdrawalIntentResponse200, PostPolkadotWithdrawalIntentResponse400, PostPolkadotWithdrawalIntentResponse401, PostPolkadotWithdrawalIntentResponse500, PostPolygonBootstrappingIntentBodyParam, PostPolygonBootstrappingIntentMetadataParam, PostPolygonBootstrappingIntentResponse200, PostPolygonBootstrappingIntentResponse400, PostPolygonBootstrappingIntentResponse401, PostPolygonBootstrappingIntentResponse500, PostPolygonDeactivationIntentBodyParam, PostPolygonDeactivationIntentMetadataParam, PostPolygonDeactivationIntentResponse200, PostPolygonDeactivationIntentResponse400, PostPolygonDeactivationIntentResponse401, PostPolygonDeactivationIntentResponse500, PostPolygonRewardsRestakeIntentBodyParam, PostPolygonRewardsRestakeIntentMetadataParam, PostPolygonRewardsRestakeIntentResponse200, PostPolygonRewardsRestakeIntentResponse400, PostPolygonRewardsRestakeIntentResponse401, PostPolygonRewardsRestakeIntentResponse500, PostPolygonRewardsWithdrawalIntentBodyParam, PostPolygonRewardsWithdrawalIntentMetadataParam, PostPolygonRewardsWithdrawalIntentResponse200, PostPolygonRewardsWithdrawalIntentResponse400, PostPolygonRewardsWithdrawalIntentResponse401, PostPolygonRewardsWithdrawalIntentResponse500, PostPolygonStakeIntentBodyParam, PostPolygonStakeIntentMetadataParam, PostPolygonStakeIntentResponse200, PostPolygonStakeIntentResponse400, PostPolygonStakeIntentResponse401, PostPolygonStakeIntentResponse500, PostPolygonStakeIntentResponse503, PostPolygonWithdrawalIntentBodyParam, PostPolygonWithdrawalIntentMetadataParam, PostPolygonWithdrawalIntentResponse200, PostPolygonWithdrawalIntentResponse400, PostPolygonWithdrawalIntentResponse401, PostPolygonWithdrawalIntentResponse500, PostSolanaDeactivationIntentBodyParam, PostSolanaDeactivationIntentMetadataParam, PostSolanaDeactivationIntentResponse200, PostSolanaDeactivationIntentResponse400, PostSolanaDeactivationIntentResponse401, PostSolanaDeactivationIntentResponse500, PostSolanaStakeIntentBodyParam, PostSolanaStakeIntentMetadataParam, PostSolanaStakeIntentResponse200, PostSolanaStakeIntentResponse400, PostSolanaStakeIntentResponse401, PostSolanaStakeIntentResponse500, PostSolanaStakeIntentResponse503, PostSolanaWithdrawalIntentBodyParam, PostSolanaWithdrawalIntentMetadataParam, PostSolanaWithdrawalIntentResponse200, PostSolanaWithdrawalIntentResponse400, PostSolanaWithdrawalIntentResponse401, PostSolanaWithdrawalIntentResponse500, SubmitTransactionBodyParam, SubmitTransactionMetadataParam, SubmitTransactionResponse200, SubmitTransactionResponse400, SubmitTransactionResponse401, SubmitTransactionResponse500, SubmitTransactionResponse503 } from './types';
