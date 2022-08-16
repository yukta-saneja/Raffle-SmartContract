//tests for real testnets

const { assert, expect } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
//const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains } = require("../../helper-hardhat-config")
developmentChains.includes(network.name)
    ? describe.skip //if on a development chain then skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          //one giant test only
          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
                  //enter the raffle, rest chainlink will do, u only need to check stuff if it is right
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  //  we cant access deployer from before each so we get all signers and its 0th acc will be deployer
                  const accounts = await ethers.getSigners()
                  //set up listener before entering raffle just in case blockchain moves really fast
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              //since we are entering the raffle with only deployer account so it should be the winner only
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              //as the array should be reset now and there should be no players, can also check this using unit test away
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      //
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      //note bal of deployer after entering contract
                      const winnerStartingBalance = await accounts[0].getBalance()
                      //this code wont complete until our listener has finished listening as the whole promise is in await
                  })

                  //   //entering the raffle
                  //   console.log("Entering Raffle...")
                  //   const txResponse = await raffle.enterRaffle({ value: raffleEntranceFee })
                  //   const txReceipt = await txResponse.wait(6)
                  //   const winnerStartingBalance = await accounts[0].getBalance()
                  //   console.log("Time to wait...")
                  //   // emit accepts two parameters, 1st is contract, which will emit event, 2nd is event name in string form
                  //   expect(txReceipt).to.emit(raffle, "WinnerPicked") // Expect the event to fire,
                  //   // Now the event is emitted, we can run our code to test for things after event is fired

                  //   console.log("WinnerPicked event fired")
                  //   try {
                  //       //asserts
                  //       console.log("Made it here!!!")
                  //       const recentWinner = await raffle.getRecentWinner()
                  //       const raffleState = await raffle.getRaffleState()
                  //       const winnerEndingBalance = await accounts[0].getBalance()
                  //       const endingTimeStamp = await raffle.getLatestTimestamp()

                  //       await expect(raffle.getPlayer(0)).to.be.reverted
                  //       assert.equal(recentWinner.toString(), accounts[0].address) //deployer
                  //       assert.equal(raffleState, 0)
                  //       assert.equal(
                  //           winnerEndingBalance.toString(),
                  //           winnerStartingBalance.add(raffleEntranceFee).toString()
                  //       )
                  //       assert(endingTimeStamp > startingTimeStamp)
                  //   } catch (error) {
                  //       console.log(error)
                  //   }
              })
          })
      })

//in order to test this staging test fw is needed
/**
 * get our subid for chainlink vrf
 * (go get some link and eth from faucet link in course, if u dont see link in ur wallet
 * go to link token contract site, grab token address for ur testnet, and do import token in wallet)
 * (go to vrf.chain.link, create subscription, add funds, get subid, put in hardhat config
 * can check link to be funded acc to current costs in docs.chainlink-evm-contract address-0.25 link approx
 * so about 2-3 link is enough to fund)
 * deploy our contract using the subid
 * (deploy it and can visit link of verification to see deployed code)
 * register the contract with chainlink vrf and its subid
 * (grab address of deployed contract and register as consumer on created subscription on vrf.chain.link)
 * (now go to keepers.chain.link to register new upkeep, select custom, put address, gas 500000, min link 13, email address etc
 * )
 * register the contract with chainlink keeper
 * run staging test
 * (can do through enter.js, or even from ui of etherscan where contract is deployed and verified
 * and on writing contract section can call fns,)(write hh test)
 * (deploy on rinkeby by hh test --network rinkeby)
 */
