import { genKeys, derivePublicKey, signPayment, signStakeDelegation } from "@o1labs/client-sdk";

const log = data => console.log(data);

// Convert Mina to order of base 9 decimal
const convertToGiga = minaValue => minaValue * 10 ** 9;

// Create a new Mina wallet account. Return wallet { publicKey, privateKey }
const generateNewWallet = () => genKeys();

// Generate Wallet from a private key
const getWalletFromPrivateKey = privateKey => ({
  privateKey,
  publicKey: derivePublicKey(privateKey)
});

// Sign a payment transaction
// Return a signed transaction that can be broadcasted using https://minaexplorer.com/broadcast-tx
const signPaymentTransaction = (wallet, receiverPublicAddress, amount, fee, nonce, memo = "") =>
  signPayment(
    {
      to: receiverPublicAddress,
      from: wallet.publicKey,
      amount: convertToGiga(amount),
      fee: convertToGiga(fee),
      nonce,
      memo
    },
    wallet
  );

// Sign a stake delegation transaction
// Return a signed transaction that can be broadcasted using https://minaexplorer.com/broadcast-delegation
const signDelegationTransaction = (wallet, stakePublicAddress, fee, nonce, memo = "") =>
  signStakeDelegation(
    {
      to: stakePublicAddress,
      from: wallet.publicKey,
      fee: convertToGiga(fee),
      nonce,
      memo
    },
    wallet
  );

const printHelp = () => {
  const prefix = "node index.js";
  return `Simple commands for signing Mina transactions offline. Useful for managing air-gapped cold wallets.
  
  Usage: ${prefix} [COMMAND] [PARAMETER]...
  
  Below are available COMMANDs and their PARAMETERs.
  COMMANDs are case insensitive.
  This help is displayed if no COMMAND is specified.
  
    NewWallet
      Create a new wallet. It does not take any PARAMETER.
      Usage: ${prefix} NewWallet
  
    PublicKey
      Derive a public key from a private key.
      Usage: ${prefix} PublicKey [PRIVATE_KEY]
  
    Payment
      Sign a payment transaction.
      Broadcast the signed transaction using https://minaexplorer.com/broadcast-tx.
      Usage: ${prefix} Payment [PRIVATE_KEY] [RECEIVER] [AMOUNT] [FEE] [NONCE] <MEMO>
  
    Delegation
      Sign a stake delegation transaction.
      Broadcast the signed transaction using https://minaexplorer.com/broadcast-delegation.
      Usage: ${prefix} Delegation [PRIVATE_KEY] [RECEIVER] [FEE] [NONCE] <MEMO>
  
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
