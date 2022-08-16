const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab", //picked from vrfcoord address for rinkeby from chainlink docs
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // key hash from docs for v1
        subscriptionId: "11200",
        callbackGasLimit: "500000",
        interval: "30", //30sec
    },
    //could also set common info in default
    31337: {
        name: "hardhat",
        //vrfcoord address not here as we r deploying mocks for this
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // using same gas lane as rinkeby because dont care
        callbackGasLimit: "500000",
        interval: "30",
    },
}
const developmentChains = ["hardhat", "localhost"]
module.exports = {
    networkConfig,
    developmentChains,
}
