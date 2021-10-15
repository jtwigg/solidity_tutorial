import { ethers } from 'hardhat'
import chai, { util } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity, MockProvider } from 'ethereum-waffle'
import { Lottery } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Wallet } from '@ethersproject/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { roundToEth } from './utils/convert'
import { copyFileSync } from 'fs'


chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai

describe('IOU Tests', () => {
    beforeEach(async () => {
        ethers.provider.send("hardhat_reset", [])
    })
    // 4
    describe('Test Contract', async () => {
        it('-', async () => {

            const [owner, customer1, customer2] = await ethers.getSigners()

            expect(await customer1.getBalance().then(roundToEth)).to.eq(10000.0)

            const iosFactory = await ethers.getContractFactory('IOU', owner)
            let iosContract = await iosFactory.deploy();

            //Owner queues 2 payments
            await iosContract.queue(customer1.address, { value: parseEther("1.0") })
            await iosContract.queue(customer2.address, { value: parseEther("2.0") })

            //Expect him to have less ether
            expect(await owner.getBalance().then(roundToEth)).to.eq(9997.0)

            // expect customer to have more ether
            expect(await customer1.getBalance().then(roundToEth)).to.eq(10000.0)
            await iosContract.connect(customer1).withdraw()
            expect(await customer1.getBalance().then(roundToEth)).to.eq(10001.0)

            // expect customer to have more ether
            await iosContract.connect(customer2).withdraw()
            expect(await customer2.getBalance().then(roundToEth)).to.eq(10002.0)
        })
    })

})
