const { ethers } = require(`hardhat`)
const { print, getChainId } = require("../../shared/utilities")

const contracts = require('../../../constants/contracts')
const initials = require('../../../constants/initials')

const deployAirDrop = async (deployer) => {
    const chainId = await getChainId()
    const tokenAddress = initials.AIRDROP_TOKEN[chainId]               // HELIX / tokenB
    const withdrawPhaseDuration = initials.AIRDROP_WITHDRAW_PHASE_DURATION[chainId]
    const initialBalance = initials.AIRDROP_INITIAL_BALANCE[chainId]

    print(`Deploy Air Drop`)
    print(`tokenAddress: ${tokenAddress}`)
    print(`withdrawPhaseDuration: ${withdrawPhaseDuration}`)

    const ContractFactory = await ethers.getContractFactory('AirDrop')
    const contract = await ContractFactory.deploy(
        tokenAddress,
        withdrawPhaseDuration
    )     
    await contract.deployTransaction.wait()
    print(`Air Drop deployed to ${contract.address}`)

    /*
    // Send funds of outputToken to the contract
    const IToken = await ethers.getContractFactory('TestToken')
    token = await IToken.attach(tokenAddress).connect(deployer) 

    print(`Send ${initialBalance} tokens to airdrop`)
    // Add zeros since token has 18 decimals
    await token.transfer(contract.address, initialBalance.toString() + '000000000000000000')
    */
}

module.exports = { deployAirDrop } 
