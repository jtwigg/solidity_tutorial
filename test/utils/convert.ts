import { BigNumber } from '@ethersproject/bignumber'
import { util } from 'chai'
import { ethers } from 'hardhat'


export function toWei(eth: number): BigNumber {
    return ethers.utils.parseEther(`${eth}`)
}

// Rounds to one decimal places
export function roundToEth(wei: BigNumber) {
    let ethString = ethers.utils.formatEther(wei)
    let eth = Number.parseFloat(ethString);
    return Math.round(eth * 10)/10
}
