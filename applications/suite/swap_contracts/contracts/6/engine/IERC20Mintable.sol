/**
 * @title Interface for mintable ERC20
 */

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Mintable is IERC20 {
    /**
     * @dev Create `amount` tokens for `to`, increasing the total supply.
     *
     * Emits a {Transfer} event.
     */
    function mint(address to, uint256 amount) external;
}
