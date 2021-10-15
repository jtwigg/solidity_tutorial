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

describe('Random Tests', () => {
    // 4
    describe('Test Contract', async () => {
        it('-', async () => {

            const [owner, customer] = await ethers.getSigners()


            const testFactory = await ethers.getContractFactory('Test', owner)
            let testContract = await testFactory.deploy(owner.address);
            await owner.sendTransaction({ to: testContract.address, value: 10000 })
            await testContract.connect(customer).queue({ value: 1000 });
        })
    })

})
