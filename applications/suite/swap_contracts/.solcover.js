const shell = require('shelljs'); // This module is already a solidity-coverage dep

module.exports = {
    onCompileComplete: async function(config){
        shell.rm('-rf', './build'); // Remove the compiled file
        await shell.exec('npm run build:coverage');  // restart the compile and typechain.
    },
    // onIstanbulComplete: async function(config){
    //     shell.rm('-rf', './typechain'); // Clean up at the end
    // },
  }
