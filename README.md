# mina-offline-util

This is a simple CLI app for signing Mina Protocol transactions offline. The signed transactions can later be broadcasted from a different computer with internet connection to the Mina network. This app is useful for managing air-gapped cold wallets.

<img src="screenshot.gif" alt="demo screenshot" width="640">

## Preparation

- Node.js is required to run this script. Install Node.js on both your online and offline computers.

- On online computer, checkout the source code and install all dependencies.

```bash
git clone https://github.com/t4top/mina-offline-util.git
cd mina-offline-util
npm install
```

- Copy the script file (`index.js`), its configuration (`package.json`) and its dependencies (`node_modules` folder) to your offline computer using a USB stick.

> **Note:** `index.js`, `package.json` and `node_modules` must all remain in the same folder.

## Usage

- Execute below command on the offline computer to start the app.

```bash
node index.js
```

- The app will show an interactive CLI that will guide you through the steps. Follow the prompts and enter appropriate values. Above gif image is a sample screen capture of the CLI in action.

- Copy the output JSON of the script to your online computer using a USB stick.

## Broadcast signed transactions

- The output JSON should look like below.

For signed payment transaction:

```json
{
  "signature": {
    "field": "14753603935....",
    "scalar": "20270149766...."
  },
  "publicKey": "B62qmd....",
  "data": {
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
  "signature": {
    "field": "20501294904....",
    "scalar": "17717981555...."
  },
  "publicKey": "B62qmd....",
  "data": {
    "to": "B62qmd....",
    "from": "B62qmd....",
    "fee": "10000000",
    "nonce": "1",
    "memo": "Stake Delegation",
    "validUntil": "4294967295"
  }
}
```

- On online computer, go to https://minaexplorer.com/broadcast-tx for payment transfer transaction or https://minaexplorer.com/broadcast-delegation for stake delegation. Paste the JSON output and click the send button.

- You might get a warning error like below. It is a false warning in most cases.

> _Something went wrong please try again. Error was: unknown._

- Wait few minutes for the transaction to be propagated through the network. Confirm this on the Mina Explorer.

## License

[Apache-2.0](./LICENSE)
