//tests for development chains

const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip
    : //describe blocks cant identiy promises so they dont make async function, so only fn
      describe("Raffle Unit Tests", function () {
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
          const chainId = network.config.chainId
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //deploy all and mocks have all tag so they both run
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer) //deployer only calls this mock as well
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })
          describe("construcor", function () {
              it("initialises the raffle correctly", async function () {
                  //ideally we make our tests have just 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  //we only wanna call constructor when raffle in open state
                  assert.equal(raffleState.toString(), "0") //enum stored as 0-open, 1-close so here in bigno. so converted to string
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"]) //matching interval with helperconfig interval
              })
          })
          describe("enterRaffle", function () {
              it("reverts when you don't pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )
              })
              it("records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  //we are entering raffle by paying entrance fee and since we r only one we should be at 0 index by deloyer acc.
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              //entering event emits event which are tested as- search ethereum waffle- chai matchers
              it("emits event on enter", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("doesnt allow entrance when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  //to check this we need to send raffle to closed state, this happens when when performupkeep is
                  //calculating, but for it to do so upkeepneeded is to be true, which becomes true after 30 sec
                  //we will pretend to be chainlink keeper network to have checkupkeep return true w/o waiting for interval
                  //as interval might be too high so we cant wait
                  //search hardhat network-refernce, we can use various json rpc methods using hardhat to perform various things
                  //hardhat network methods can be used to oerform many things onlocal network
                  //u can use some special testing/debugging methods listed such as evm_increaseTime and evm_mine
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  //(method, parameter list), we wanna inc time by interval+1 to make sure interval has passed
                  await network.provider.send("evm_mine", [])
                  //need to mine 1 block(thats why [] empty passed) after interval to proceed further
                  //or can do as-
                  // await network.provider.request({method: "evm_mine", params: []})

                  //pretending to be chainlink keeper
                  await raffle.performUpkeep([]) //passing empty calldata
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })
          })
          describe("checkUpkeep", function () {
              it("returns false if people havent sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]) //callStatic is used when we
                  //do not want to send a real transaction but only simulate it, so it gets us the returnsof the fn called
                  //i.e. memory and upkeepneeded and we extract upkeepneeded out of it only
                  //if not callstatic written, it would take it as a tx becoz this fn is public and not view
                  assert(!upkeepNeeded)
                  //since we sent no money upkeepneeded shud be false, if true returns error
              })
              it("returns false if raffle isnt open", async function () {
                  //bring contract to calculating state
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([]) //0x is interpreted as blank bytes object, cud do simply [] as before
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = raffle.callStatic.checkUpkeep([])
                  assert.equal(raffleState.toString(), "1") //state should be calculating
                  assert(!upkeepNeeded)
              })
              it("returns false if enough time hasnt passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]) //sending less time
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time passed, has players, eth, and is open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
          })
          describe("performUpkeep", function () {
              it("it can only run if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep([]) //if failed or errors out, then tx is not got so false
                  assert(tx)
              })
              it("revents when checkupkeep is false", async function () {
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpkeepNotNeeded"
                      //it is smart enough to also identify things it is reverted with but if u wanna specify use string interpulation
                  )
              })
              it("updates the raffle state, emits an event, and calls the vrfcoordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await raffle.performUpkeep([])
                  //before emitting RequestedRaffleWinner event, vrfcoordinator is called which also emits an event
                  //while calculating random no., and in that event also request id is involved, but we need from
                  //the RequestedRaffleWinner event so it comes at no. 2 i.e. index 1 of emitted events
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.events[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(requestId.toNumber() > 0)
                  assert.equal(raffleState.toString(), "1")
              })
          })
          describe("fulfillRandomWords", function () {
              //to make sure somebody has entered the raffle before every it, we need a before each here
              beforeEach(async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })
              //performpkeep results in calling of vrfcoordinator which calls requestrandomwords and guves back requestid
              //which goes to the overriden fn fullfillrandomwords which gives random words
              //so requestid is needed to run this fn
              it("can only be called after performUpkeep", async function () {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  //fulfill random words in vrfcoordinator takes 2 param- req id and consumer address
                  //here as req id 0 so should revert error, with any reqid it should revert as we havent called performupkeep yet
                  //but it is tedious to check for every no. so we can use fuzztesting (later)
              })
              //massive promise test
              it("picks a winner, resets the lottery and sends the money", async function () {
                  //for this we need extra 3 ppl in our array of players
                  const additionalEntrants = 3
                  //since in array deployer is at 0 index becoz of beforeeach we did, so start from 1 to add 3 more fake entrants
                  const startingAccountIndex = 1
                  const accounts = await ethers.getSigners() //to fetch fake accounts
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedRaffle = raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                  }
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  //need to set up a listener to listen to the events so that fulfillrandomwords can be called and
                  //we can check further things
                  //we will need to mock keeper to call performupkeep, then mock vrf to call fullfillrandomwords
                  await new Promise(async (resolve, reject) => {
                      //need to call fn within this promise only as otherwise listener wont get activated to the event
                      //once winnerpicked event occur do something, but dont wait forever in case an issue
                      //so set a timeout of 300 sec through mocha in hardhatconfig, if timedout so this fails
                      //a try catch is used to catch any error and not break system
                      //ideally listeners whould be placed most above in it, but since we are on dev chain so we control
                      raffle.once("WinnerPicked", async () => {
                          //when winnerpicked do further things
                          console.log("Found the event!")

                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              /** run fw lines to find who is going to be the winner after mocking contract down there
                               * then after that accs starting and ending balance 
                             console.log(recentWinner)
                              console.log(accounts[2].address)
                              console.log(accounts[1].address)
                              console.log(accounts[0].address)
                              console.log(accounts[3].address)
                              */
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              //to check if players array is reset
                              const numPlayers = await raffle.getNumberOfPlayers()
                              const winnerEndingBalance = await accounts[1].getBalance()
                              assert(numPlayers.toString() == "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(
                                          raffleEntranceFee
                                              .mul(additionalEntrants)
                                              .add(raffleEntranceFee)
                                      )
                                      .toString() //all money entered in raffle
                              )
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      //mocking keeper
                      const tx = await raffle.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      const winnerStartingBalance = await accounts[1].getBalance()
                      //mocking vrfcoordmock, we dont have control over mocks in testnet(writing staging tests) so we cant do that there,
                      //we will have to wait for listener to be activated naturally there
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })
