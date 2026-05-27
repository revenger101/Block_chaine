module.exports = {
  networks: {
    // ── Ganache (local blockchain) ───────────────────────────────────
    // Make sure Ganache is running before deploying.
    // Default Ganache GUI port is 7545; CLI (ganache) uses 8545.
    development: {
      host      : "127.0.0.1",
      port      : 7545,       // change to 8545 if using ganache CLI
      network_id: "*",        // match any network id
    },
  },

  compilers: {
    solc: {
      version : "0.8.19",
      settings: {
        evmVersion: "paris",
        optimizer : {
          enabled: true,
          runs   : 200,
        },
      },
    },
  },
};
