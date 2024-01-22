/**
 * @title Reclaimable
 * @dev This contract gives owner right to recover any ERC20 tokens accidentally sent to
 * the token contract. The recovered token will be sent to the owner of token.
 */

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Reclaimable is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    mapping (address => uint256) private _allowedBalances;

    /**
     * @dev Emitted when the allowance of a `token` to be held by this contract.
     */
    event AllowedTokenBalance(address indexed token, uint256 value);

    /**
     * @notice Let the owner to retrieve other tokens accidentally sent to this contract.
     * @dev This function is suitable when no token of any kind shall be stored under
     * the address of the inherited contract.
     * @param tokenToBeRecovered address of the token to be recovered.
     */
    function reclaimToken(IERC20 tokenToBeRecovered) public onlyOwner {
        uint256 balance = tokenToBeRecovered.balanceOf(address(this)).sub(_allowedBalances[address(tokenToBeRecovered)]);
        tokenToBeRecovered.safeTransfer(owner(), balance);
    }

    /**
     * @dev Get the allowance of the `tokenToBeRecovered` token of this contract.
     * @param tokenToBeRecovered address of the token to be recovered.
     */
    function getAllowedBalance(address tokenToBeRecovered) public view returns (uint256) {
        return _allowedBalances[tokenToBeRecovered];
    }

    /**
     * @notice Atomically increases the allowance of token balance granted to `tokenToBeRecovered` by the caller.
     * @dev Emits an {AllowedTokenBalance} event indicating the updated allowance.
     * @param tokenToBeRecovered address of the token to be recovered.
     * @param addedValue increase in the allowance.
     */
    function increaseAllowedBalance(address tokenToBeRecovered, uint256 addedValue) internal virtual returns (bool) {
        _setAllowedBalance(tokenToBeRecovered, _allowedBalances[tokenToBeRecovered].add(addedValue));
        return true;
    }

    // /**
    //  * @notice Atomically decreases the allowance of token balance granted to `tokenToBeRecovered` by the caller.
    //  * @dev Emits an {AllowedTokenBalance} event indicating the updated allowance.
    //  * @param tokenToBeRecovered address of the token to be recovered.
    //  * @param subtractedValue decrease in the allowance.
    //  */
    // function decreaseAllowedBalance(address tokenToBeRecovered, uint256 subtractedValue) internal virtual returns (bool) {
    //     _setAllowedBalance(tokenToBeRecovered, _allowedBalances[tokenToBeRecovered].sub(subtractedValue));
    //     return true;
    // }

    /**
     * @notice Sets `amount` as the allowance of this contract over the `tokenToBeRecovered` tokens.
     * @param tokenToBeRecovered address of the token to be recovered.
     * @param amount allowance.
     */
    function _setAllowedBalance(address tokenToBeRecovered, uint256 amount) internal virtual {
        _allowedBalances[tokenToBeRecovered] = amount;
        emit AllowedTokenBalance(tokenToBeRecovered, amount);
    }
}
