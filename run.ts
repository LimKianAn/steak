import steak from "@api/blockdaemon";
import Web3 from "web3";

console.log("\n\u{1F608} \u{1F608} \u{1F608}\n");

declare var Bun: {
  env: {
    EXECUTION_API_KEY: string;
    NETWORK: string;
    PRIVATE_KEY: string;
    RECEIVER_ADDRESS: string;
    STAKING_API_KEY: string;
  };
};
var contractAddr = "";
switch (Bun.env.NETWORK) {
  case "mainnet":
    contractAddr = "0x3f124c700fb5e741f128e28985267d44f56b242f";
    break;
  case "holesky":
    contractAddr = "0x0b6e07c5ead5596c1f26ca2f6b97050cec853671";
    break;
  default:
    console.log(`Network ${Bun.env.NETWORK} not supported`);
    process.exit(0);
}

const web3 = new Web3(
  `https://svc.blockdaemon.com/ethereum/${Bun.env.NETWORK}/native?apiKey=${Bun.env.EXECUTION_API_KEY}`
);

const sender = web3.eth.accounts.wallet.add(Bun.env.PRIVATE_KEY)[0];
console.log("Sender Address:", sender.address, "\n");

const balWei = await web3.eth.getBalance(sender.address);
const balance = web3.utils.fromWei(balWei.toString(), "ether");
console.log(`Sender Balance: ${balance.toString()} ETH\n`);

const amountInETH = 0.000001;
const shouldSend = confirm(
  `Send ${amountInETH} ETH to the receiver ${Bun.env.RECEIVER_ADDRESS} on ${Bun.env.NETWORK} to validate the envs?`
);

if (shouldSend) {
  console.log("\nSending to the receiver ...\n");
  const receipt = await web3.eth.sendTransaction({
    from: sender.address,
    to: Bun.env.RECEIVER_ADDRESS,
    value: web3.utils.toWei(amountInETH, "ether"), // in wei
  });
  console.log("Receipt:", receipt, "\n");
}

console.log("\n \u{1F969} \u{1F969} \u{1F969} \n");

steak.auth(Bun.env.STAKING_API_KEY);

const shouldCreateUnsigned = confirm(
  `Create the unsigned transaction which sends 32 ETH to the contract ${contractAddr} on ${Bun.env.NETWORK}?`
);
if (!shouldCreateUnsigned) {
  process.exit(0);
}
console.log("\nCreating the unsigned transaction ...\n");

const amountInGwei = 32 * 10 ** 9;
const { data } = await steak.postEthereumStakeIntent(
  {
    stakes: [
      {
        amount: amountInGwei.toString(),
        withdrawal_address: sender.address,
      },
    ],
  },
  { network: Bun.env.NETWORK }
);
const intent = data.ethereum;
console.log("Intent:", intent, "\n");

const shouldSignAndSend = confirm(`Sign the unsigned transaction and send the signed one?`);
if (!shouldSignAndSend) {
  process.exit(0);
}

console.log("\nProcessing ...\n");

const receipt = await web3.eth.sendTransaction({
  from: sender.address,
  to: contractAddr,
  value: web3.utils.toWei(amountInGwei, "gwei"),
  data: intent?.unsigned_transaction,
});
console.log("Receipt:", receipt, "\n");
