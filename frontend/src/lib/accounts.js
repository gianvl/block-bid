// Default Hardhat dev accounts derived from the public mnemonic
// "test test test test test test test test test test test junk".
// These keys are PUBLIC and only safe on a localhost chain — never reuse
// them on any network with real value.
export const ACCOUNTS = [
  {
    label: "Auctioneer",
    short: "Auctioneer",
    role: "auctioneer",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    label: "Bidder 1 (Alice)",
    short: "Alice",
    role: "bidder",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    label: "Bidder 2 (Bob)",
    short: "Bob",
    role: "bidder",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    label: "Bidder 3 (Carol)",
    short: "Carol",
    role: "bidder",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
  {
    label: "Bidder 4 (Dave)",
    short: "Dave",
    role: "bidder",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  },
];
