import Client from "mina-signer";

const MINA_NETWORK = "mainnet";

const mina = new Client({ network: MINA_NETWORK });

const log = data => console.log(data);

// Convert Mina to order of base 9 decimal
const convertToGiga = minaValue => minaValue * 10 ** 9;

// Create a new Mina wallet account. Return wallet { publicKey, privateKey }
const generateNewWallet = () => mina.genKeys();

// Generate Wallet from a private key
const getWalletFromPrivateKey = privateKey => ({
  privateKey,
  publicKey: mina.derivePublicKey(privateKey)
});

// Sign a payment transaction
// Return a signed transaction that can be broadcasted using https://minaexplorer.com/broadcast-tx
const signPaymentTransaction = (wallet, receiverPublicAddress, amount, fee, nonce, memo = "") =>
  mina.signPayment(
    {
      to: receiverPublicAddress,
      from: wallet.publicKey,
      amount: convertToGiga(amount),
      fee: convertToGiga(fee),
      nonce,
      memo
    },
    wallet.privateKey
  );

// Sign a stake delegation transaction
// Return a signed transaction that can be broadcasted using https://minaexplorer.com/broadcast-delegation
const signDelegationTransaction = (wallet, stakePublicAddress, fee, nonce, memo = "") =>
  mina.signStakeDelegation(
    {
      to: stakePublicAddress,
      from: wallet.publicKey,
      fee: convertToGiga(fee),
      nonce,
      memo
    },
    wallet.privateKey
  );

const printHelp = () => {
  const prefix = "node index.js";
  return `Simple commands for signing Mina transactions offline. Useful for managing air-gapped cold wallets.
  
  Usage: ${prefix} COMMAND [PARAMETER]...
  
  Below are available COMMANDs and their PARAMETERs.
  This help is displayed if no COMMAND is specified.
  
    newwallet
      Create a new wallet. It does not take any PARAMETER.
      Usage: ${prefix} newwallet
  
    publickey
      Derive a public key from a private key.
      Usage: ${prefix} publickey <PRIVATE_KEY>
  
    payment
      Sign a payment transaction.
      Broadcast the signed transaction using https://minaexplorer.com/broadcast-tx.
      Usage: ${prefix} payment <PRIVATE_KEY> <RECEIVER> <AMOUNT> <FEE> <NONCE> [MEMO]
  
    delegation
      Sign a stake delegation transaction.
      Broadcast the signed transaction using https://minaexplorer.com/broadcast-delegation.
      Usage: ${prefix} delegation <PRIVATE_KEY> <RECEIVER> <FEE> <NONCE> [MEMO]
  
  Note:
  - AMOUNT and FEE are in Mina.
  - MEMO is optional.
  - Put MEMO in quotes ("") if more than one word.
  - Do not share your PRIVATE_KEY with anyone.
  `;
};

const main = () => {
  let output;

  try {
    const args = process.argv.slice(2);
    let wallet;

    switch (args[0]?.toLowerCase()) {
      case "newwallet":
        output = generateNewWallet();
        break;
      case "publickey":
        output = getWalletFromPrivateKey(args[1]);
        break;
      case "payment":
        wallet = getWalletFromPrivateKey(args[1]);
        output = signPaymentTransaction(wallet, ...args.slice(2));
        break;
      case "delegation":
        wallet = getWalletFromPrivateKey(args[1]);
        output = signDelegationTransaction(wallet, ...args.slice(2));
        break;
      default:
        output = printHelp();
        break;
    }
  } catch (e) {
    output = { message: "Unexpected Error", error: e };
  }

  output && log(output);
};

main();
