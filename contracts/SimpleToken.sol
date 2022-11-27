//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.16;
import "hardhat/console.sol";


contract SimpleToken {

  string public name = "Mi Simple Token";
  string public symbol = "MST";

  uint256 public totalSupply = 1_000_000;

  address public owner;

  mapping(address => uint256) balances;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  constructor() {
    balances[msg.sender] = totalSupply;
    owner = msg.sender;
  }

  function transfer(address to, uint256 amount) external {
    //Aseguramos que el que manda tiene tokens
    require(balances[msg.sender] >= amount, "Not enought tokens");
    if (msg.sender != to){
      console.log("Transferring %s tokens: %s => %s", amount, msg.sender,to);
      balances[msg.sender] -= amount;
      balances[to] += amount;
      emit Transfer(msg.sender, to, amount);
    }
  }

  function balanceOf(address account) external view returns (uint256){
    console.log("Querying balance of %s: %s", account, balances[account]);
    return balances[account];
  }


}
