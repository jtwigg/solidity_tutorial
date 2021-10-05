import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/types'
import { task } from 'hardhat/config'

task("hello", "Prints 'Hello, World!'", async function (
  taskArguments,
  hre,
  runSuper
) {
  console.log("Hello, World!");
});

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{ version: '0.8.6', settings: {} }],
  }
}

export default config
