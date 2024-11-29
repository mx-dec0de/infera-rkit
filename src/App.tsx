import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { utils, BigNumberish } from "ethers";
import Link from "next/link";
import { Icon } from "./components/icon";
const { formatUnits, parseUnits } = utils;

import { polygon } from 'wagmi/chains';

import { airdropABI } from "./components/airdropAbi";


const airdropContractAddress = "0xBbd5043af1E1E9aA40c3b55c67b9cf716539d0Da";
const decimals = 6

function App() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [claimable, setClaimable] = useState<string | null>(null);
  const [finalized, setFinalized] = useState<boolean | null>(null);
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);

  const fetchClaimableTokens = async () => {
    if (!address || !publicClient) return;

    try {
      const tokens = await publicClient.readContract({
        address: airdropContractAddress,
        abi: airdropABI,
        functionName: "claimableTokens",
        args: [address],
      });
      setClaimable(formatUnits(tokens as BigNumberish, decimals));
    } catch (error) {
      console.error("Error fetching claimable tokens:", error);
    }
  };

  

  // Check if finalized
  const checkFinalized = async () => {
    if (!address || !publicClient) return;
    try {
      const isFinalized = await publicClient.readContract({
        address: airdropContractAddress,
        abi: airdropABI,
        functionName: "finalized",
        args:[]
      });
      setFinalized(isFinalized as boolean);
    } catch (error) {
      console.error("Error checking finalized status:", error);
    }
  };

  // Check if user has claimed
  const checkHasClaimed = async () => {
    if (!address || !publicClient) return;

    try {
      const claimed = await publicClient.readContract({
        address: airdropContractAddress,
        abi: airdropABI,
        functionName: "hasClaimed",
        args: [address],
      });
      setHasClaimed(claimed as boolean);
    } catch (error) {
      console.error("Error checking claimed status:", error);
    }
  };

  // Check if user is a participant
  const checkParticipant = async () => {
    if (!address || !publicClient) return;

    try {
      const participant = await publicClient.readContract({
        address: airdropContractAddress,
        abi: airdropABI,
        functionName: "isParticipant",
        args: [address],
      });
      setIsParticipant(participant as boolean);
    } catch (error) {
      console.error("Error checking participant status:", error);
    }
  };

  // Claim tokens
  const claimTokens = async () => {
    if (!walletClient) return;

    try {
      const tx = await walletClient.writeContract({
        address: airdropContractAddress,
        abi: airdropABI,
        functionName: "claim",
      });
      alert(`Claim successful! Transaction hash: ${tx}`);
    } catch (error) {
      console.error("Error claiming tokens:", error);
      alert("Failed to claim tokens.");
    }
  };


  useEffect(() => {
    if (isConnected && address) {
      console.log("Wallet changed. Fetching updated data...");
      checkFinalized();
      fetchClaimableTokens();
      checkHasClaimed();
      checkParticipant();
    } else {
      console.log("Wallet disconnected or no address. Resetting state...");
      setFinalized(null);
      setClaimable(null);
      setHasClaimed(null);
      setIsParticipant(null);
    }
  }, [address, isConnected, publicClient]); // Dependencies: address or connection state changes


  return (
    <div
    className="relative w-full h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/images/newBack.png')" }}
  >
    <div className="absolute top-4 right-4 z-20">
      <ConnectButton />
    </div>
    
    <div className="flex items-center justify-center w-full h-full">
    <div
        className="absolute inset-0 hidden sm:flex"
        style={{
          opacity: 0.07,
          filter: "blur(2px)",
          transform: "translate3d(0px, 0px, 0px)",
          background: "radial-gradient(rgba(255, 204, 0, 1) 0%, rgba(255, 255, 255, 0) 70%)"}}
      ></div>
      <div className="flex-1 sm:flex-initial flex flex-col justify-center relative w-full !max-w-[600px] rounded-lg border border-foreground/5 bg-[#59191b] py-10 custom-border ">
        <div className="bg-[rgb(25,25,27)] w-full max-w-md rounded-lg shadow-lg m-20">
        <div className="flex justify-center items-center w-full mb-6">
          <Link href={"/"}>
            <Icon icon="logo" height={24} />
          </Link>
          
        </div>
        <div className="flex justify-center items-center w-full mb-6">
          <h1 className="text-white text-4xl font-bold uppercase mt-4">Infera Airdrop</h1>
        </div>
          <div className="mb-6 text-center justify-center">
          
          {!isConnected && (
  <div className="text-center mb-4">
    <p className="text-white mb-4">
      Please connect your wallet to check your claimable tokens and receive the airdrop.
    </p>
    <div className="inline-block">
      <ConnectButton />
    </div>
  </div>
)}
{isConnected && (
  <>
    <p className="text-white text-center mb-4">
      Connected Address: {address}
    </p>

    {claimable && parseFloat(claimable) > 0 && (
      <p className="text-white text-center mb-4">
        You are eligible to claim your tokens: {claimable} Airdrop Tokens.
      </p>
    )}

    {finalized === false && (
      <p className="text-white text-center mb-4">
        The airdrop event has not started yet. The airdrop allocation may still
        change during the snapshot upload.
      </p>
    )}

    {finalized && parseFloat(claimable || "0") === 0 && (
      <p className="text-white text-center mb-4">
        We're sorry, but you are not eligible for this airdrop.
      </p>
    )}

    {finalized && parseFloat(claimable || "0") > 0 && !hasClaimed && (
      <>
        <p className="text-white text-center mb-4">
          Congratulations! You are eligible to claim your tokens.
        </p>
        <button
          onClick={async () => {
            await claimTokens();
            // Re-check after claim to update state
            await checkHasClaimed();
          }}
          className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Claim Tokens
        </button>
      </>
    )}

    {hasClaimed && (
      <p className="text-white text-center mb-4">
        You have already claimed your tokens. Congratulations!
      </p>
    )}
  </>
)}


          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
}

export default App;