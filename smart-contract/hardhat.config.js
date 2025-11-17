require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.17",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC
      // chainId: 1337,                // ✅ Match Ganache's chain ID
      accounts: [
        "0xffb4ac5fd1be542f3857fd05b2f703df63ed9dbd32a18b4f4dd5a1820c98b015"
      ]
    }
  }
};
