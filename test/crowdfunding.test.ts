import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import exp from 'constants'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { CreateAuction, Crowdfunding } from '../typechain'
import { roundToEth, toWei } from './utils/convert'
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
    let wallet4: SignerWithAddress
    let wallet5: SignerWithAddress
    let recipiant: SignerWithAddress

    beforeEach(async () => {
        // 1
        ethers.provider.send("hardhat_reset", [])
        let signers = await ethers.getSigners()

        walletManager = signers[0]
        wallet1 = signers[1]
        wallet2 = signers[2]
        wallet3 = signers[3]
        wallet4 = signers[4]
        wallet5 = signers[5]

        recipiant = signers[6]



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


            await crownFundingContract.connect(wallet1).contribute({ value: toWei(3) })
            await crownFundingContract.connect(wallet2).contribute({ value: toWei(3.5) })
            await crownFundingContract.connect(wallet3).contribute({ value: toWei(5) })
            await crownFundingContract.connect(wallet4).contribute({ value: toWei(4) })
            await crownFundingContract.connect(wallet5).contribute({ value: toWei(3) })

            expect(await crownFundingContract.getBalance()).to.eq(toWei(18.5))

            let voteIndex1Async = await crownFundingContract.functions.createRequest("req1", recipiant.address, toWei(3))
            let voteIndex2Async = await crownFundingContract.functions.createRequest("req2", recipiant.address, toWei(4))
            let voteIndex3Async = await crownFundingContract.functions.createRequest("req3", recipiant.address, toWei(4))

            // Filters
            let filter = crownFundingContract.filters.RequestCreated()

            let result = await filterEvents(crownFundingContract, filter, voteIndex3Async)
            let requestIndex3 = result.args[0].toNumber()
            expect(requestIndex3).eq(2)



            console.log("1.1")
            // Expect this to fail as there's been not votes
            await expect(crownFundingContract.makePayment(0)).to.be.rejectedWith("Number of voters not reached", "Expect trying to make payment too early to fails")

            console.log("1.2")

            // Vote > 50%
            crownFundingContract.connect(wallet1).vote(requestIndex3)
            crownFundingContract.connect(wallet2).vote(requestIndex3)
            crownFundingContract.connect(wallet3).vote(requestIndex3)

            expect((await crownFundingContract.requests(requestIndex3)).value).to.eq(toWei(4)) // Expected value
            expect(await recipiant.getBalance()).eq(toWei(10000))// No money yet. 
            await crownFundingContract.makePayment(requestIndex3)
            expect(await recipiant.getBalance()).eq(toWei(10000 + 4)) //Money received

        })
    })


})