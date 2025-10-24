require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.17",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache default RPC port
      accounts: [
        "0x407aa32db7efaa3485ef5f73c302da1c1f7d346f29946bdf29688f3e300c5892"
      ]
    }
  }
};
