const contractABI = require('../contract-abi.json')
const contractAddress = "0xa8a697FA112D9b8faC44b59258CEE1F37ac2356B";

var Contract = require('web3-eth-contract');

import { pinJSONToIPFS } from './nftstorage';

export const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const obj = {
          status: "👆🏽 Write a message in the text-field above.",
          address: addressArray[0],
        };
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

export const getCurrentWalletConnected = async () => {
if (window.ethereum) {
    try {
    const addressArray = await window.ethereum.request({
        method: "eth_accounts",
    });
    if (addressArray.length > 0) {
        return {
        address: addressArray[0],
        status: "👆🏽 Write a message in the text-field above.",
        };
    } else {
        return {
        address: "",
        status: "🦊 Connect to Metamask using the top right button.",
        };
    }
    } catch (err) {
    return {
        address: "",
        status: "😥 " + err.message,
    };
    }
} else {
    return {
    address: "",
    status: (
        <span>
        <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
            </a>
        </p>
        </span>
    ),
    };
}
};

export const mintNFT = async(url, name, description) => {
//error handling
    if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) { 
        return {
            success: false,
            status: "❗Please make sure all fields are completed before minting.",
        }
    }

    const metadata = new Object();
    metadata.name = name;
    metadata.image = url;
    metadata.description = description;
    
    const nftstorageResponse = await pinJSONToIPFS(metadata);
    if(!nftstorageResponse.success) {
        return {
            success: false,
            status: "😢 Something went wrong while uploading your metadata.",
        }
    }
    const tokenURI = nftstorageResponse.ipfs;

    window.contract = await new Contract(contractABI, contractAddress);

        //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.safeMint(window.ethereum.selectedAddress, tokenURI).encodeABI()//make call to NFT smart contract 
    };

    //sign the transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}