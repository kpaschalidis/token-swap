/**
 * @title Token upgrade swap engine
 */

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "../property/Reclaimable.sol";
import "./IERC20Mintable.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SwapEngine is Context, Ownable, Reclaimable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public oldToken;
    IERC20Mintable public newToken;
    uint256 public constant conversionRate = 1; // 1:1
    uint256 public totalConverted;
    mapping(address => uint256) public convertedBalanceOf;

    /**
     * @dev Emitted when old tokens are swaapped for new ones.
     */
    event TokenSwapped(
        address indexed holder,
        address indexed caller,
        uint256 oldTokenAmount
    );

    /**
     */
    modifier onlyOldToken() {
        require(msg.sender == address(oldToken), "caller is not the old token");
        _;
    }

    /**
     * @dev Create a token swap engine providing an ERC20 token and a new one.
     * @notice The difference in decimal between the old one and the new one is 10.
     * @param _newOwner address of the swap engine contract owner
     * @param _oldToken address of the old token contract
     * @param _newToken address of the new token contract
     */
    constructor(
        address _newOwner,
        address _oldToken,
        address _newToken
    ) public {
        transferOwnership(_newOwner);
        oldToken = IERC20(_oldToken);
        newToken = IERC20Mintable(_newToken);
    }

    function sourceToken() public returns (address) {
        return address(oldToken);
    }

    /**
     * @dev Swap all the tokens of the given token holders in a batch.
     * @notice This function is restricted for the engine owner. If a non=token holder
     * It does not revert when balance is zero, so that the rest can proceed.
     * @param tokenHolders array of wallet addresses of token holders
     */
    function swapAllTokenInBatch(address[] calldata tokenHolders)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < tokenHolders.length; i++) {
            uint256 balance = oldToken.balanceOf(tokenHolders[i]);
            _swap(tokenHolders[i], balance);
        }
    }

    /**
     * @dev Swap all the tokens of a given token holder.
     * @notice This function is restricted for the engine owner or by tokenholders for themselves.
     * It reverts when balance is zero. No need to proceed with the swap.
     * @param tokenHolder wallet addresse of the token holder
     */
    function swapAllToken(address tokenHolder) public {
        require(
            owner() == _msgSender() || tokenHolder == _msgSender(),
            "Either the owner or a tokenholder can swapAllToken"
        );
        uint256 balance = oldToken.balanceOf(tokenHolder);
        require(balance > 0, "No token to swap");
        _swap(tokenHolder, balance);
    }

    /**
     * @dev Swap some tokens of the caller
     * @notice This function can be called by any account, even account without old token.
     * It reverts when balance is zero. No need to proceed with the swap.
     * @param amount amount of old token to be swapped into new ones.
     */
    function swapToken(uint256 amount) public {
        uint256 balance = oldToken.balanceOf(_msgSender());
        require(balance > 0, "No token to swap");
        require(amount <= balance, "Swap amount is bigger than the balance");
        _swap(_msgSender(), amount);
    }

    /* @dev Swap some old tokens owned by a wallet.
     * @notice Can be called only by the 'oldTokenContract'
     * @param tokenHolder wallet addresse of the token holder
     * @param amount amount of old token to be swapped into new ones.
     */
    function migrateFrom(address tokenHolder, uint256 amount)
        public
        onlyOldToken
    {
        if (amount == 0) {
            return;
        }

        convertedBalanceOf[tokenHolder] = convertedBalanceOf[tokenHolder].add(
            amount
        );
        totalConverted = totalConverted.add(amount);
        uint256 newTokenToMint = amount.mul(conversionRate);
        newToken.mint(tokenHolder, newTokenToMint);
        emit TokenSwapped(tokenHolder, _msgSender(), amount);
    }

    /**
     * @dev Swap some old tokens owned by a wallet.
     * @notice Core logic for token swap.
     * @param tokenHolder wallet addresse of the token holder
     * @param amount amount of old token to be swapped into new ones.
     */
    function _swap(address tokenHolder, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 allowance = oldToken.allowance(tokenHolder, address(this));
        require(
            amount <= allowance,
            "Swap amount is bigger than the allowance"
        );
        convertedBalanceOf[tokenHolder] = convertedBalanceOf[tokenHolder].add(
            amount
        );
        totalConverted = totalConverted.add(amount);
        increaseAllowedBalance(address(oldToken), amount);
        uint256 newTokenToMint = amount.mul(conversionRate);
        // transfer old token to the contract.
        oldToken.safeTransferFrom(tokenHolder, address(this), amount);
        // mint new token to the token holder
        newToken.mint(tokenHolder, newTokenToMint);
        emit TokenSwapped(tokenHolder, _msgSender(), amount);
    }

    /**
     * @dev OVERRIDE method to forbide the possibility of renouncing ownership
     */
    function renounceOwnership() public override(Ownable) {
        revert("There must be an owner");
    }
}
