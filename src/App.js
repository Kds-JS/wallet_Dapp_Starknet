/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import './App.css';
import { FaEthereum } from 'react-icons/fa';
import { parseEther, formatEther } from "ethers";

// Import Wallet Json
import WalletAbi from "./abi/wallet.json";
import EtherAbi from "./abi/eth.json";

// Argent Wallet connect 
import { connect } from "@argent/get-starknet"

import {Contract} from 'starknet';

// Wallet contract Address
const WalletContractAddress = "0x0035bea5b63feb84dcaebe9c1574957b4f6670456908d3e666958661e1b7fc91";

// Ethereum contract Address
const EthereumContractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

function App() {

  const [address, setAddress] = useState();
  const [isConnected, setConnected] = useState(false);
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState(0);
  const [amountSend, setAmountSend] = useState();
  const [amountWithdraw, setAmountWithdraw] = useState();

  useEffect(() => {
    getBalance();
  }, [account])

  const connectWallet = async () => {
    // Using connect function from @argent/get-starknet to connect our Argent X wallet to our DAPP
    const windowStarknet = await connect()
    await windowStarknet?.enable({ starknetVersion: "v4" })
    
    setAccount(windowStarknet.account) // Set our account variable to windowStarknet.account (address, provider and the signer)
    setAddress(windowStarknet.selectedAddress) // Set our address variable to windowStarknet.selectedAddress
    setConnected(true) // isConnected = true, the page will changed according to the boolean
    return windowStarknet
    
  }

  async function getBalance() {
    
    if(address !== undefined) {
      const contractConnect = new Contract(WalletAbi, WalletContractAddress, account); // We set our Contract passing our Json, ContractAddress
      //                                                          and our Account (address, provider and the signer) 
 
      const newBalance = await contractConnect.get_balance(address); // Call the get_balance function of Wallet contract 
      setBalance(parseInt(newBalance));
    }
  }

  // Returns the remaining number of tokens 
  // that Wallet smart contract will be allowed to spend on behalf of user through transferFrom. This is zero by default.
  async function userAllowance () {
    const ethContract = new Contract(EtherAbi, EthereumContractAddress, account);
    const allowance = await ethContract.allowance(address, WalletContractAddress);
    return parseInt(allowance);
  }

  // Sets amount as the allowance of Wallet smart contract over the user’s tokens.
  async function approve (amount) {
    const ethContract = new Contract(EtherAbi, EthereumContractAddress, account);
    return ethContract.approve(WalletContractAddress, amount);
  }

  // deposit ethers on Wallet smart contract
  async function deposit() {
    const contractConnect = new Contract(WalletAbi, WalletContractAddress, account);
    const amountInWei = parseInt(parseEther(amountSend));

    const allowance = await userAllowance();

    if(allowance < amountInWei) {
      await approve(parseEther("10"));
    }
      
    await contractConnect.deposit(EthereumContractAddress, amountInWei);
  }

  // withdraw ethers on Wallet smart contract
  async function withdraw() {
    const contractConnect = new Contract(WalletAbi, WalletContractAddress, account);
    const amountInWei = parseInt(parseEther(amountWithdraw));
    await contractConnect.withdraw(EthereumContractAddress, amountInWei);
  }

  function changeAmountSend(e) {
    setAmountSend(e.target.value);
  }

  function changeAmountWithdraw(e) {
    setAmountWithdraw(e.target.value);
  }

  return (
    <div className="App">
      <div className="container">
        <div className="logo">
          <FaEthereum />
        </div>
        
        {isConnected ? (
          <> 
            <h2>{formatEther(balance)} <span >ETH</span></h2>
            
            <div className="wallet__flex">
              <div className="walletG">
                <h3>Deposit Ether</h3>
                <input type="text" placeholder="Montant en Ethers" onChange={changeAmountSend} />
                <button onClick={deposit}>Deposit</button>
              </div>
              <div className="walletD">
                <h3>Withdraw Ether</h3>
                <input type="text" placeholder="Montant en Ethers" onChange={changeAmountWithdraw} />
                <button onClick={withdraw}>Withdraw</button>
              </div>
            </div>
          </>
        ) : (
          <div>
            <button onClick={connectWallet}>Connect Wallet</button>
          </div>
        )
        }

      </div>
    </div>
  );
}

export default App;