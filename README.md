# mina-offline-util

A set of simple commands for signing Mina transactions offline. The signed transactions can then be broadcasted from a different computer with internet connection to Mina network. This is useful for managing air-gapped cold wallets.

## Preparation

- Node.js is required to run this script. Install Node.js on both your online and offline computers.

- On online computer, checkout the source code and install all dependencies.

```bash
git clone https://github.com/t4top/mina-offline-util.git
cd mina-offline-util
npm install
```

- Copy the script file (index.js), its configuration (package.json) and its dependencies (node_modules folder) to your offline computer using a USB stick. index.js, package.json and node_modules must remain in the same folder.

## Usage

```bash
node index.js [COMMAND] [PARAMETER]...
```

COMMANDs are case insensitive. Below are available COMMANDs and their PARAMETERs. This help is displayed if no COMMAND is specified.

**NewWallet**

Create a new wallet. It does not take any PARAMETER.

```bash
node index.js NewWallet
```

**PublicKey**

Derive a public key from a private key.

```bash
node index.js PublicKey [PRIVATE_KEY]
```

**Payment**

Sign a payment transaction.
Broadcast the signed transaction using https://minaexplorer.com/broadcast-tx.

```bash
node index.js Payment [PRIVATE_KEY] [RECEIVER] [AMOUNT] [FEE] [NONCE] <MEMO>
```

**Delegation**

Sign a stake delegation transaction.
Broadcast the signed transaction using https://minaexplorer.com/broadcast-delegation.

```bash
node index.js Delegation [PRIVATE_KEY] [RECEIVER] [FEE] [NONCE] <MEMO>
```

**_Note:_**

- AMOUNT and FEE are in Mina.
- MEMO is optional.
- Put MEMO in quotes ("") if more than one word.
- Do not share your PRIVATE_KEY with anyone.

## Broadcast signed transactions

- Copy the output JSON of the script to your online computer using a USB stick.

- The output should look like below.

  For signed payment transaction:

```json
{
  "publicKey": "B62qmd....",
  "signature": {
    "field": "14753603935....",
    "scalar": "20270149766...."
  },
  "payload": {
    "to": "B62qmd....",
    "from": "B62qmd....",
    "fee": "10000000",
    "amount": "10000000000",
    "nonce": "0",
    "memo": "Payment Transfer",
    "validUntil": "4294967295"
  }
}
```

    For signed stake delegation transaction:

```json
{
  "publicKey": "B62qmd....",
  "signature": {
    "field": "20501294904....",
    "scalar": "17717981555...."
  },
  "payload": {
    "to": "B62qmd....",
    "from": "B62qmd....",
    "fee": "10000000",
    "nonce": "0",
    "memo": "Stake Delegation",
    "validUntil": "4294967295"
  }
}
```

- Go to https://minaexplorer.com/broadcast-tx for payment transfer transaction or https://minaexplorer.com/broadcast-delegation for stake delegation. Paste the JSON output and click the send button.

- You might get a warning error like below. It is a false warning in most cases.

> _Something went wrong please try again. Error was: unknown._

- Wait few minutes for the transaction to be propagated through the network. Confirm this on the Mina Explorer.
