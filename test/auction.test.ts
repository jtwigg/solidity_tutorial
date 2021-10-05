import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import exp from 'constants'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { CreateAuction } from '../typechain'
import { roundToEth } from './convert'


chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai



describe('Acution', () => {
    let auctionFactory: CreateAuction
    let walletManager: SignerWithAddress
    let walletSeller: SignerWithAddress
    let wallet1: SignerWithAddress
    let wallet2: SignerWithAddress
    let wallet3: SignerWithAddress
    let wallets: SignerWithAddress[]

    beforeEach(async () => {
        // 1
        const signers: SignerWithAddress[] = await ethers.getSigners()

        walletManager = signers[0]
        walletSeller = signers[1]
        wallet1 = signers[2]
        wallet2 = signers[3]
        wallet3 = signers[4]
        wallets = [wallet1, wallet2, wallet3]

        // 2
        const auctionFactory_factory = await ethers.getContractFactory('CreateAuction', walletManager)
        auctionFactory = await auctionFactory_factory.deploy()
        await auctionFactory.deployed()

        // 3
        expect(auctionFactory.address).to.properAddress
        expect(await auctionFactory.ownerA()).to.eq(walletManager.address)
    })

    // 4
    describe('create Auction', async () => {
        it('success', async () => {

            await auctionFactory.connect(walletSeller).createAuction()
            let deployedAuction = await auctionFactory.deployedAuctions(0);

            // Filters
            let filter = auctionFactory.filters.ContractCreated(null, null)
            let results = await auctionFactory.queryFilter(filter)
            expect(results.length).eq(1)
            expect(results[0].args.newAddress).eq(deployedAuction)


            let auction = await ethers.getContractAt('Auction', deployedAuction)

            await auction.connect(wallet1).placeBid({ value: ethers.utils.parseEther("0.5") })
            expect(roundToEth(await auction.highestBindingBid())).eq(0.1)
            expect(roundToEth(await wallet1.getBalance())).eq(9999.5)

            await auction.connect(wallet2).placeBid({ value: ethers.utils.parseEther("0.8") })
            expect(roundToEth(await auction.highestBindingBid())).eq(0.6)

            await auction.connect(wallet3).placeBid({ value: ethers.utils.parseEther("1.0") })
            expect(roundToEth(await auction.highestBindingBid())).eq(0.9)

            await auction.connect(wallet1).placeBid({ value: ethers.utils.parseEther("0.7") })
            expect(roundToEth(await auction.highestBindingBid())).eq(1.1)


            expect(wallet2.getBalance().then(roundToEth)).eventually.eq(9999.2)
            console.log("Calling finalize")
            await auction.connect(wallet2).finalizeAuction()
            expect(wallet2.getBalance().then(roundToEth)).eventually.eq(10000)

            await auction.connect(wallet3).finalizeAuction()
            expect(wallet3.getBalance().then(roundToEth)).eventually.eq(10000)

            await auction.connect(walletSeller).finalizeAuction()
            expect(walletSeller.getBalance().then(roundToEth)).eventually.eq(10001.1)

            await auction.connect(wallet1).finalizeAuction()
            expect(wallet1.getBalance().then(roundToEth)).eventually.eq(9998.9)





            // //          await wallets[0].sendTransaction(tx)
            // for (const wallet of wallets) {
            //     await wallet.sendTransaction(tx)
            // }


            // let balance = (await lottery.getBalance()).toString()
            // expect(balance).to.eq(ethers.utils.parseEther("0.3")) // <<<<<<<<<<< THIS ISN't WORKING
            // expect(await lottery.players(0)).to.eq(wallets[0].address)
            // expect(await lottery.players(1)).to.eq(wallets[1].address)
            // expect(await lottery.players(2)).to.eq(wallets[2].address)

            // await lottery.pickWinner();

            // let balances = new Array<BigNumber>();
            // for (const wallet of wallets) {
            //     let balance = await wallet.getBalance();
            //     balances.push(balance)
            // }

            // balances.sort((a, b) => { return a.lte(b) ? -1 : 1 })
            // console.log(balances.map(ethers.utils.formatEther))
            // expect(balances[2].gt(ethers.utils.parseEther("1000.1"))).to.be.true
        })
    })

})
