require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.17",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC
      // chainId: 1337,                // ✅ Match Ganache's chain ID
      accounts: [
        "0xe8757ec4f0f2b1ebffbcecad52c69fee4ceddb672b91f3616393e4e64681fa53"
      ]
    }
  }
};
