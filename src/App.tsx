import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { utils, BigNumberish } from "ethers";

const { formatUnits, parseUnits } = utils;

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

function App() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 12,
      }}
    >
      <div style={{ alignSelf: "flex-end", padding: 12 }}>
        <ConnectButton />
      </div>

      {isConnected && address && (
        <p>
          <strong>Connected Address:</strong> {address}
        </p>
      )}

      {isConnected && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={fetchBalance}
            style={{
              padding: 12,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Fetch USDT Balance
          </button>
          {balance && (
            <p>
              <strong>USDT Balance:</strong> {balance} USDT
            </p>
          )}
        </div>
      )}

      {isConnected && (
        <div style={{ marginTop: 24, width: "100%", maxWidth: 400 }}>
          <h3>Send USDT</h3>
          <div style={{ marginBottom: 12 }}>
            <label>
              Recipient Address:
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%", marginTop: 8 }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Amount (USDT):
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                style={{ width: "100%", marginTop: 8 }}
              />
            </label>
          </div>
          <button
            onClick={sendUSDT}
            style={{
              padding: 12,
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Send USDT
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
