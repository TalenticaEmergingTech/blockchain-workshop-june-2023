import { ethers } from "ethers";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "History", href: "/history", current: false },
];

export default function Header() {
  const [connected, setConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    if (window.ethereum == null) {
      console.log("MetaMask not installed;");
    } else {
      try {
        const t_provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await t_provider.getSigner();
        setSigner(signer);
        setConnected(true);
        setAddress(await signer.getAddress());
        const bal = await signer.provider.getBalance(await signer.getAddress());
        const balEth = ethers.formatUnits(bal, "ether");
        setBalance(balEth.toString() + " MATIC");
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <header>
      <div className="flex h-16 bg-slate-500 justify-center">
        <div className="flex-auto">
          <div className="flex h-16">
            {navigation.map((nav) => {
              return (
                <a className="w-32" href={nav.href}>
                  {nav.name}
                </a>
              );
            })}
          </div>
        </div>
        <div className="w-128 text-center justify-center flex content-center">
          {!connected && (
            <button
              className="bg-sky-500 hover:bg-sky-700 h-12 w-32 rounded "
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}

          {connected && (
            <div className="flex gap-4 ">
              <div className="flex-auto grid grid-rows-2">
                <div>{address}</div>
                <div>{balance}</div>
              </div>
              <div className="h-12 w-32">Connected</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
