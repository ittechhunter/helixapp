/*
 * deploy AdvisorRewards
 * 
 * run from root:
 *      npx hardhat run scripts/0_deploy/deployAdvisorRewards.js --network 
 */

const { ethers } = require("hardhat")
const { deployAdvisorRewards } = require("../shared/deploy/deployers")

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log(`Deployer address: ${deployer.address}`)
    await deployAdvisorRewards(deployer)
    console.log(`done`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
