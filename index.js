#!/usr/bin/env node

import fs from "node:fs";
import Client from "mina-signer";
import * as p from "@clack/prompts";
import pc from "picocolors";

const MINA_NETWORK = "mainnet";
const mina = new Client({ network: MINA_NETWORK });

let wallet = {};
let nonce = "";

//---------------
// Main
//---------------

async function main() {
  intro();
  await getWallet();
  await signTransaction();
  outro();
}

main().catch(e => console.log(pc.red("\nUnexpected Error.\n"), pc.red(e.message)));

//---------------
// Functions
//---------------

function intro() {
  console.log();
  const { version } = JSON.parse(fs.readFileSync(new URL("package.json", import.meta.url), "utf-8"));
  p.intro(pc.bold(pc.blue(`mina-offline-util version ${version}`)));
}

function outro() {
  p.outro("Copy output JSON via a USB stick and broadcast it to MINA network on your online computer.");
}

async function getWallet() {
  const option = await p.select({
    message: pc.bold("Select Wallet:"),
    options: [
      { value: "key", label: "Enter a private key" },
      { value: "new", label: "Create a new wallet" }
    ]
  });
  isCancel(option);

  if (option === "new") wallet = mina.genKeys();
  else await getPrivateKey();

  p.log.message(`Wallet Public Address: ${wallet.publicKey}`);

  await showPrivateKey();
}

async function getPrivateKey() {
  const privateKey = await p.password({
    message: "Enter Private Key:",
    validate(value) {
      if (!value.length) return "Private Key is required!";
    }
  });
  isCancel(privateKey);
  wallet = { privateKey, publicKey: mina.derivePublicKey(privateKey) };
}

async function showPrivateKey() {
  const show = await p.confirm({
    message: "Show Private Key?",
    initialValue: false
  });
  isCancel(show);
  if (show) {
    p.log.message(`Wallet Private Key: ${wallet.privateKey}`);
    p.log.warn("Keep your Private Key secure. Do not share it with anyone.");
  }
}

async function signTransaction() {
  let next = true;

  while (next) {
    const option = await p.select({
      message: pc.bold("What will you like to sign?"),
      options: [
        { value: "pay", label: "Payment Transaction" },
        { value: "stake", label: "Stake Delegation" }
      ]
    });
    isCancel(option);

    if (option === "pay") await signPayment();
    else await signStakeDelegation();

    next = await p.confirm({
      message: "Sign another transaction?",
      initialValue: false
    });
    isCancel(next);
  }
}

async function signOptions(initOptions) {
  const options = await p.group(
    {
      ...initOptions,

      nonce: () =>
        p.text({
          message: "Nonce:",
          placeholder: "    (you can check Nonce value on Mina Explorer)",
          initialValue: nonce.toString(),
          validate(value) {
            if (!value.length) return "Nonce is required!";
            if (Number.isNaN(value)) return "Nonce must be an integer!";
            if (!Number.isInteger(Number(value))) return "Nonce must be an integer!";
          }
        }),

      fee: () =>
        p.text({
          message: "Fee:",
          initialValue: "0.01",
          validate(value) {
            if (!value.length) return "Fee is required!";
            if (Number.isNaN(value)) return "Fee must be a number!";
          }
        }),

      memo: () =>
        p.text({
          message: "Memo:",
          placeholder: "    (hit Enter to leave empty)",
          defaultValue: ""
        })
    },
    {
      onCancel: cancel
    }
  );

  nonce = Number(options.nonce) + 1;
  return options;
}

async function signPayment() {
  const options = {
    amount: () =>
      p.text({
        message: "How much $MINA do you want to send?",
        validate(value) {
          if (!value.length) return "Value is required!";
          if (Number.isNaN(value)) return "Amount must be a number!";
        }
      }),
    receiver: () =>
      p.text({
        message: "Enter Receiver Wallet Address:",
        validate(value) {
          if (!value.length) return "Receiver address is required!";
          if (!value.startsWith("B62")) return "Entered address is not valid!";
        }
      })
  };

  const { amount, receiver, fee, nonce, memo } = await signOptions(options);
  const result = mina.signPayment(
    {
      to: receiver,
      from: wallet.publicKey,
      amount: toDecimalBase9(amount),
      fee: toDecimalBase9(fee),
      nonce: Number(nonce),
      memo
    },
    wallet.privateKey
  );
  console.log("\n", result, "\n");
}

async function signStakeDelegation() {
  const options = {
    validator: () =>
      p.text({
        message: "Enter Validator Address:",
        validate(value) {
          if (!value.length) return "Validator address is required!";
          if (!value.startsWith("B62")) return "Entered address is not valid!";
        }
      })
  };

  const { validator, fee, nonce, memo } = await signOptions(options);
  const result = mina.signStakeDelegation(
    {
      to: validator,
      from: wallet.publicKey,
      fee: toDecimalBase9(fee),
      nonce: Number(nonce),
      memo
    },
    wallet.privateKey
  );
  console.log("\n", result, "\n");
}

// Convert Mina value to order of base 9 decimal
function toDecimalBase9(minaValue) {
  return minaValue * 10 ** 9;
}

function cancel() {
  p.cancel("Operation cancelled");
  return process.exit(1);
}

function isCancel(prop) {
  if (p.isCancel(prop)) cancel();
}
