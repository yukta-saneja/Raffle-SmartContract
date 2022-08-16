//mocks needed only for dev chains
const { developmentChains } = require("../helper-hardhat-config")
//we are using v1 of vrf coordinator here not v2
const BASE_FEE = ethers.utils.parseEther("0.1") //it is cost to make each request, mentioned in chainlink docs.
//earlier, pricefeeds didnt cost anything because they are sponsored, while here chainlink does all job so we need to pay it
const GAS_PRICE_LINK = 1e9 //calculated value based on the gas price of the chain, fluctuates based on price of actual chain,
//as chainlink is paying this gas to get things done for us- here gas price chosen rondomly, it is link per gas
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        //deploy a mock vrfcoordinator...
        //chainlink github "smartcontractkit/chainlink"- contracts-src-v0.8-mocks-has vrfcoordinatormocksv2.sol
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args, //takes basefee and gas price link
        })
        log("Mocks Deployed!")
        log("__________________________________________________")
    }
}
module.exports.tags = ["all", "mocks"]
