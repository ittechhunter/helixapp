const { run } = require(`hardhat`)
const { print, getChainId } = require("../../shared/utilities")

const initials = require("../../../constants/initials")
const contracts = require("../../../constants/contracts")

const verifyPaymentSplitter = async () => {
    const chainId = await getChainId()
    const paymentSplitterAddress = contracts.paymentSplitter[chainId]
    const payees = initials.PAYMENT_SPLITTER_PAYEES[chainId]
    const shares = initials.PAYMENT_SPLITTER_SHARES[chainId]

    print("verify payment splitter")
    print(`paymentSplitterAddress ${paymentSplitterAddress}`)

    if (payees.length != shares.length) {
        print(`payees length (${payees.length}) != shares length (${shares.length})`)
        return
    }

    print("payees: shares")
    const length = payees.length
    for(let i = 0; i < length; i++) {
        print(`${payees[i]}: ${shares[i]}`)
    }

    await run(
        "verify:verify", {
            address: paymentSplitterAddress,
            constructorArguments: [
                payees,
                shares 
            ]
        }
    )
}

module.exports = { verifyPaymentSplitter }
