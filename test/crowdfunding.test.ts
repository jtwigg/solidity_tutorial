import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import exp from 'constants'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { CreateAuction, Crowdfunding } from '../typechain'
import { roundToEth } from './utils/convert'
import { filterEvents } from './utils/filters'


chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai



describe('CrowdFunding', () => {
    let crownFundingContract: Crowdfunding
    let walletManager: SignerWithAddress
    let wallet1: SignerWithAddress
    let wallet2: SignerWithAddress
    let wallet3: SignerWithAddress
    let recipiant: SignerWithAddress

    beforeEach(async () => {
        // 1
        ethers.provider.send("hardhat_reset", [])
        let signers = await ethers.getSigners()

        walletManager = signers[0]
        wallet1 = signers[1]
        wallet2 = signers[2]
        wallet3 = signers[3]
        recipiant = signers[4]



        // 2
        const factory = await ethers.getContractFactory('Crowdfunding', walletManager)
        let tomorrow = new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000))
        crownFundingContract = await factory.deploy(BigNumber.from(1000), BigNumber.from(tomorrow.getTime()))
        await crownFundingContract.deployed()

        // 3
        expect(crownFundingContract.address).to.properAddress
    })

    // 4
    describe('create', async () => {
        it('success', async () => {

            await crownFundingContract.connect(wallet1).contribute({ value: 300 })
            await crownFundingContract.connect(wallet2).contribute({ value: 350 })
            await crownFundingContract.connect(wallet3).contribute({ value: 500 })

            expect(await crownFundingContract.getBalance()).to.eq(1150)

            let voteIndex1 = await crownFundingContract.functions.createRequest("req1", recipiant.address, BigNumber.from(400))
            let voteIndex2 = await crownFundingContract.functions.createRequest("req2", recipiant.address, BigNumber.from(400))

            // Filters
            let filter = crownFundingContract.filters.RequestCreated()

            let result = await filterEvents(crownFundingContract, filter, voteIndex2)
            expect(result.args[0].toNumber()).eq(1)

            crownFundingContract.connect(wallet1).vote(result.args[0])
            //      crownFundingContract.connect(wallet1).vote()


            // await auction.connect(wallet1).placeBid({ value: ethers.utils.parseEther("0.5") })
            // expect(roundToEth(await auction.highestBindingBid())).eq(0.1)
            // expect(roundToEth(await wallet1.getBalance())).eq(9999.5)

            // await auction.connect(wallet2).placeBid({ value: ethers.utils.parseEther("0.8") })
            // expect(roundToEth(await auction.highestBindingBid())).eq(0.6)

            // await auction.connect(wallet3).placeBid({ value: ethers.utils.parseEther("1.0") })
            // expect(roundToEth(await auction.highestBindingBid())).eq(0.9)

            // await auction.connect(wallet1).placeBid({ value: ethers.utils.parseEther("0.7") })
            // expect(roundToEth(await auction.highestBindingBid())).eq(1.1)


            // expect(wallet2.getBalance().then(roundToEth)).eventually.eq(9999.2)
            // console.log("Calling finalize")
            // await auction.connect(wallet2).finalizeAuction()
            // expect(wallet2.getBalance().then(roundToEth)).eventually.eq(10000)

            // await auction.connect(wallet3).finalizeAuction()
            // expect(wallet3.getBalance().then(roundToEth)).eventually.eq(10000)

            // await auction.connect(walletSeller).finalizeAuction()
            // expect(walletSeller.getBalance().then(roundToEth)).eventually.eq(10001.1)

            // await auction.connect(wallet1).finalizeAuction()
            // expect(wallet1.getBalance().then(roundToEth)).eventually.eq(9998.9)

        })
    })

})
