require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    // //copied from repo
    // defaultNetwork: "hardhat",
    // networks: {
    //     hardhat: {
    //         // // If you want to do some forking, uncomment this
    //         // forking: {
    //         //   url: MAINNET_RPC_URL
    //         // }
    //         chainId: 31337,
    //     },
    //     localhost: {
    //         chainId: 31337,
    //     },
    //     // kovan: {
    //     //     url: KOVAN_RPC_URL,
    //     //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //     //     //accounts: {
    //     //     //     mnemonic: MNEMONIC,
    //     //     // },
    //     //     saveDeployments: true,
    //     //     chainId: 42,
    //     // },
    //     rinkeby: {
    //         url: RINKEBY_RPC_URL,
    //         accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //         //   accounts: {
    //         //     mnemonic: MNEMONIC,
    //         //   },
    //         saveDeployments: true,
    //         chainId: 4,
    //     },
    //     // mainnet: {
    //     //     url: MAINNET_RPC_URL,
    //     //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //     //     //   accounts: {
    //     //     //     mnemonic: MNEMONIC,
    //     //     //   },
    //     //     saveDeployments: true,
    //     //     chainId: 1,
    //     // },
    //     // polygon: {
    //     //     url: POLYGON_MAINNET_RPC_URL,
    //     //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //     //     saveDeployments: true,
    //     //     chainId: 137,
    //     // },
    // },
    // etherscan: {
    //     // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    //     apiKey: {
    //         rinkeby: ETHERSCAN_API_KEY,
    //         //   kovan: ETHERSCAN_API_KEY,
    //         //  polygon: POLYGONSCAN_API_KEY,
    //     },
    // },
    // gasReporter: {
    //     enabled: false,
    //     currency: "USD",
    //     outputFile: "gas-report.txt",
    //     noColors: true,
    //     // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    // },
    // contractSizer: {
    //     runOnCompile: false,
    //     only: ["Raffle"],
    // },
    // namedAccounts: {
    //     deployer: {
    //         default: 0, // here this will by default take the first account as deployer
    //         1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    //     },
    //     player: {
    //         default: 1,
    //     },
    // },
    // solidity: {
    //     compilers: [
    //         {
    //             version: "0.8.7",
    //         },
    //         {
    //             version: "0.4.24",
    //         },
    //     ],
    // },
    // mocha: {
    //     timeout: 500000, // 500 seconds max for running tests
    // },

    //self
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        rinkeby: {
            chainId: 4,
            blockConfirmations: 6,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            rinkeby: ETHERSCAN_API_KEY,
            // kovan: ETHERSCAN_API_KEY,
            // polygon: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false, //dont wanna print gas report always so set false then
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    solidity: "0.8.7",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 800000, //200000 millisecond=200 sec max
    },
}
/**
 * GENERAL NOTES
 * in prettier rc, print width means, after 100 chars, new line
 *
 */
