module.exports = {
  networks: {
    development: {
      host      : "127.0.0.1",
      port      : 7545,
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version : "0.8.19",       // ← 0.8.20 → 0.8.19
      settings: {
        evmVersion: "paris",    // ← force l'EVM compatible Ganache
        optimizer : {
          enabled: true,
          runs   : 200,
        },
      },
    },
  },
};