import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { utils, BigNumberish } from "ethers";
import Link from "next/link";
import { Icon } from "./components/icon";
const { formatUnits, parseUnits } = utils;

// Constants for USDT contract
const usdtContractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const usdtABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
function Glow() {
  return (
    <div
      style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        background: "radial-gradient(rgba(255, 204, 0, 1) 0%, rgba(255, 140, 0, 0) 100%)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Превращаем в квадрат
        filter: "blur(20px)", // Добавляем размытие
        opacity: 0.6, // Полупрозрачность
        zIndex: 0, // Размещаем позади
      }}
    ></div>
  );
}
function App() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Fetch USDT Balance
  const fetchBalance = async () => {
    if (!address || !publicClient) return;

    try {
      const rawBalance = await publicClient.readContract({
        address: usdtContractAddress,
        abi: usdtABI,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(formatUnits(rawBalance as BigNumberish, 6));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Send USDT Transaction
  const sendUSDT = async () => {
    if (!walletClient || !recipient || !amount) {
      alert("Recipient or amount is missing.");
      return;
    }

    const parsedAmount = parseUnits(amount, 6);

    try {
      const hash = await walletClient.writeContract({
        address: usdtContractAddress,
        abi: usdtABI,
        functionName: "transfer",
        args: [recipient, parsedAmount],
      });
      alert(`Transaction sent! Hash: ${hash}`);
    } catch (error) {
      console.error("Error sending USDT:", error);
      alert("Failed to send USDT.");
    }
  };

  return (
    <div
    className="relative w-full h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/images/newBack.png')" }}
  >
    {/* Кнопка подключения кошелька в правом верхнем углу */}
    <div className="absolute top-4 right-4 z-20">
      <ConnectButton />
    </div>
    
    {/* Центрированный контейнер */}
    <div className="flex items-center justify-center w-full h-full">
    <div
        className="absolute inset-0 hidden sm:flex"
        style={{
          opacity: 0.07,
          filter: "blur(2px)",
          transform: "translate3d(0px, 0px, 0px)",
          background: "radial-gradient(rgba(255, 204, 0, 1) 0%, rgba(255, 255, 255, 0) 70%)",
          boxShadow: `
          box-shadow: 2px 2px 5px 0px rgba(255,255,255,0.48);
        `,
        }}
      ></div>
      <div className="flex-1 sm:flex-initial flex flex-col justify-center relative w-full !max-w-[600px] rounded-lg border border-foreground/5 bg-[#59191b] py-10 custom-border "
      style={{
        boxShadow: `
          box-shadow: -1px -1px 5px 0px rgba(255,255,255,0.48);
        `,
      }}>
        <div className="bg-[rgb(25,25,27)] w-full max-w-md rounded-lg shadow-lg m-20">
        <Link href={"/"} className=""><Icon icon="logo" height={24} /></Link>
          <div className="mb-6 text-center justify-center">
          

            
            {isConnected && address && (
              <p className="text-center text-[rgba(251,249,248,0.5)] mb-4">
                <strong>Connected Address:</strong> {address}
              </p>
            )}
  
            {isConnected && (
              <>
                <button
                  onClick={fetchBalance}
                  className="w-full mb-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Fetch USDT Balance
                </button>
  
                {balance && (
                  <p className="text-center text-[rgba(251,249,248,0.5)] mb-4">
                    <strong>USDT Balance:</strong> {balance} USDT
                  </p>
                )}
  
                <div className="mb-4">
                  <label className="block text-[rgba(251,249,248,0.5)]">
                    Recipient Address:
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full mt-2 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
  
                <div className="mb-6">
                  <label className="block text-[rgba(251,249,248,0.5)]">
                    Amount (USDT):
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full mt-2 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </label>
                </div>
  
                <button
                  onClick={sendUSDT}
                  className="w-full py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
                >
                  Send USDT
                </button>
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
