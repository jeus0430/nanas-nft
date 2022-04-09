import { Button } from '@apideck/components';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/router";
import { CalendarIcon, ClockIcon, DiscordIcon, MoneyIcon, TwitterIcon } from "../components/svgIcons";
import { ethers } from 'ethers';
import { NextPage } from "next";
import myEpicNft from "../Nanas.json";

const CONTRACT_ADDRESS = '0xe00deb3799629F72636FF384C4763D0F80af5773'
// 0x4F47Bc496083C727c5fbe3CE9CDf2B0f6496270c
// 0xe34cf1a62471cd7723e02ce06311a6d66bc7dde7
// 1SIE8_HHpeQX0CZ_6CXQkBWe4ZLdbHhCBkFFDlHlLxIc
// 1fD4ShKtmayKXr12_vAmfwV6dp75JPmX7fHBJ8j_Uy4E
const Mint: NextPage = () => {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [etherScanLink, setEtherScanLink] = useState<undefined | string>()
  const [openSeaLink, setOpenSeaLink] = useState<undefined | string>()
  const [rightNet, setRightNet] = useState(false)
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window as any

    if (!ethereum) {
      console.log('Make sure you have metamask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      // setupEventListener()
      setupNetworkListener()
    } else {
      console.log('No authorized account found')
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      // setupEventListener()
      setupNetworkListener()
      // checkNetwork()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  // const setupEventListener = async () => {
  //   // Most of this looks the same as our function askContractToMintNft
  //   try {
  //     const { ethereum } = window as any

  //     if (ethereum) {
  //       // Same stuff again
  //       const provider = new ethers.providers.Web3Provider(ethereum)
  //       const signer = provider.getSigner()
  //       const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

  //       // THIS IS THE MAGIC SAUCE.
  //       // This will essentially "capture" our event when our contract throws it.
  //       // If you're familiar with webhooks, it's very similar to that!
  //       connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
  //         console.log(from, tokenId.toNumber())
  //         setOpenSeaLink(
  //           `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
  //         )
  //       })

  //       console.log('Setup event listener!')
  //     } else {
  //       console.log("Ethereum object doesn't exist!")
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window as any

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft, signer)

        console.log('Going to pop wallet now to pay gas...')
        const nftTxn = await connectedContract.mintToken(1, { value: ethers.utils.parseUnits("0.01", 8) })
        setIsMinting(true)
        alert('Mining... please wait. This could take a couple of minutes')
        await nftTxn.wait()
        setIsMinting(false)
        console.log(nftTxn)
        setEtherScanLink(`https://cronos.org/explorer/testnet3/tx/${nftTxn.hash}`)
        alert('NFT Minted!' + nftTxn.hash)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setupNetworkListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window as any

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        provider.on('network', (newNetwork, oldNetwork) => {
          // When a Provider makes its initial connection, it emits a "network"
          // event with a null oldNetwork along with the newNetwork. So, if the
          // oldNetwork exists, it represents a changing network

          console.log('newNetwork', newNetwork)
          console.log('oldNetwork', oldNetwork)

          if (oldNetwork) {
            window.location.reload() as any
            return
          }
          if (newNetwork?.chainId !== 338) {
            alert('Wrong Network! Please switch to Cronos Test')
            setRightNet(false)
          } else {
            setRightNet(true)
          }
        })
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
  const renderNotConnectedContainer = () => (
    <Button onClick={connectWallet} className="mt-3 cta-B connect-wallet-button">
      Connect to Wallet
    </Button>
  )

  const renderMintUI = () => {
    if (etherScanLink) {
      return (
        <div>
          <a href={etherScanLink} target="_blank" rel="noopener noreferrer">
            <Button className="mt-3 mr-1 cta-button connect-wallet-button">See on cronos</Button>
          </a>
          {openSeaLink && (
            <a href={openSeaLink} target="_blank" rel="noopener noreferrer">
              <Button className="mt-3 ml-1 cta-button connect-wallet-button">See on opensea</Button>
            </a>
          )}
        </div>
      )
    }
    return (
      <Button
        onClick={askContractToMintNft}
        className="mt-3 cta-button connect-wallet-button"
        isLoading={isMinting}
      >
        {isMinting ? 'Mining... please wait' : 'Mint NFT'}
      </Button>
    )
  }
  return (
    <div className="container">
      <div className="main">
        <div className="mint-page">
          <div className="mint-media">
            {/* eslint-disable-next-line */}
            <img
              src="/home-2.jpg"
              alt=""
            />
          </div>
          <div className="mint-content">
            <h2>CroBoys</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation</p>
            <h4><span><CalendarIcon /></span>March 23rd</h4>
            <h4><span><ClockIcon /></span>5pm UTC</h4>
            <h4><span><MoneyIcon /></span>150 Cro</h4>
            <div className="mint-actions">
              {(currentAccount === '' || !rightNet) ? renderNotConnectedContainer() : renderMintUI()}

              <Link href="/#">
                <a>
                  <DiscordIcon color="white" size={30} />
                </a>
              </Link>
              <Link href="/#">
                <a>
                  <TwitterIcon color="white" size={30} />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mint