import { ethers } from 'hardhat'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity, MockProvider } from 'ethereum-waffle'
import { Lottery } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Wallet } from '@ethersproject/wallet'
import { BigNumber } from '@ethersproject/bignumber'


chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai

describe('Counter', () => {
    let lottery: Lottery
    let walletManager: SignerWithAddress
    let wallet2, wallet3, wallet4: SignerWithAddress
    let wallets: SignerWithAddress[]

    beforeEach(async () => {
        // 1
        ethers.provider.send("hardhat_reset", [])
        const signers: SignerWithAddress[] = await ethers.getSigners()

        walletManager = signers[0]
        wallet2 = signers[1]
        wallet3 = signers[2]
        wallet4 = signers[3]
        wallets = [wallet2, wallet3, wallet4]

        // 2
        const lotteryFactory = await ethers.getContractFactory('Lottery', walletManager)
        lottery = await lotteryFactory.deploy()
        await lottery.deployed()
        const initialCount = await lottery.getBalance()

        // 3
        expect(initialCount).to.eq(0)
        expect(lottery.address).to.properAddress
    })

    // 4
    describe('enter lottery', async () => {
        it('-', async () => {

            let tx = { to: lottery.address, value: ethers.utils.parseEther("0.1") }

            for (const wallet of wallets) {
                await wallet.sendTransaction(tx)
            }

            let balance = (await lottery.getBalance()).toString()
            expect(balance).to.eq(ethers.utils.parseEther("0.3"))
            expect(await lottery.players(0)).to.eq(wallets[0].address)
            expect(await lottery.players(1)).to.eq(wallets[1].address)
            expect(await lottery.players(2)).to.eq(wallets[2].address)

            await lottery.pickWinner();

            let balances = new Array<BigNumber>();
            for (const wallet of wallets) {
                let balance = await wallet.getBalance();
                balances.push(balance)
            }

            balances.sort((a, b) => { return a.lte(b) ? -1 : 1 })
            expect(balances[2].gt(ethers.utils.parseEther("1000.1"))).to.be.true
        })
    })

})
