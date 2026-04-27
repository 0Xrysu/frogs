"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Goby types
interface AssetBalanceResp {
  confirmed: string;
  spendable: string;
  spendableCoinCount: number;
}

interface GobyProvider {
  request: (args: { method: string; params?: Record<string, unknown> }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    chia?: GobyProvider;
  }
}

interface GobyContextType {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  publicKeys: string[];
  chainId: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getBalance: (assetId?: string) => Promise<AssetBalanceResp | null>;
  takeOffer: (offer: string) => Promise<unknown>;
  createOffer: (params: {
    offerAssets: { assetId: string; amount: number }[];
    requestAssets: { assetId: string; amount: number }[];
    fee?: number;
  }) => Promise<unknown>;
  signMessage: (message: string, publicKey: string) => Promise<string | null>;
}

const GobyContext = createContext<GobyContextType | undefined>(undefined);

export function GobyProvider({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKeys, setPublicKeys] = useState<string[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);

  // Check if Goby is installed
  useEffect(() => {
    const checkGoby = () => {
      if (typeof window !== "undefined" && window.chia) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoby()) {
      // Try to restore session
      tryRestoreSession();
    }

    // Also check after a delay (Goby might inject later)
    const timer = setTimeout(checkGoby, 500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isInstalled || typeof window === "undefined" || !window.chia) return;

    const handleAccountsChanged = () => {
      // Re-fetch public keys when accounts change
      fetchPublicKeys();
    };

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(newChainId as string);
    };

    window.chia.on("accountsChanged", handleAccountsChanged);
    window.chia.on("chainChanged", handleChainChanged);

    return () => {
      if (window.chia) {
        window.chia.removeListener("accountsChanged", handleAccountsChanged);
        window.chia.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isInstalled]);

  const fetchPublicKeys = async () => {
    if (!window.chia) return;
    try {
      const keys = await window.chia.request({ method: "getPublicKeys" });
      setPublicKeys(keys as string[]);
      return keys as string[];
    } catch (error) {
      console.error("Failed to get public keys:", error);
      return [];
    }
  };

  const fetchChainId = async () => {
    if (!window.chia) return;
    try {
      const id = await window.chia.request({ method: "chainId" });
      setChainId(id as string);
      return id;
    } catch (error) {
      console.error("Failed to get chain ID:", error);
      return null;
    }
  };

  const tryRestoreSession = async () => {
    if (!window.chia) return;
    try {
      // Try eager connect (won't show popup if already connected)
      const connected = await window.chia.request({
        method: "connect",
        params: { eager: true },
      });
      if (connected) {
        setIsConnected(true);
        await fetchPublicKeys();
        await fetchChainId();
      }
    } catch {
      // Silent fail for eager connect
    }
  };

  const connect = useCallback(async () => {
    if (!window.chia) {
      // Open Goby download page
      window.open("https://www.goby.app/", "_blank");
      return false;
    }

    setIsConnecting(true);
    try {
      const connected = await window.chia.request({ method: "connect" });
      if (connected) {
        setIsConnected(true);
        await fetchPublicKeys();
        await fetchChainId();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect to Goby:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setPublicKeys([]);
    setChainId(null);
  }, []);

  const getBalance = useCallback(
    async (assetId?: string): Promise<AssetBalanceResp | null> => {
      if (!window.chia || !isConnected) return null;
      try {
        const balance = await window.chia.request({
          method: "getAssetBalance",
          params: {
            type: assetId ? "cat" : null,
            assetId: assetId || null,
          },
        });
        return balance as AssetBalanceResp;
      } catch (error) {
        console.error("Failed to get balance:", error);
        return null;
      }
    },
    [isConnected]
  );

  const takeOffer = useCallback(
    async (offer: string) => {
      if (!window.chia || !isConnected) {
        throw new Error("Goby not connected");
      }
      return window.chia.request({
        method: "takeOffer",
        params: { offer },
      });
    },
    [isConnected]
  );

  const createOffer = useCallback(
    async (params: {
      offerAssets: { assetId: string; amount: number }[];
      requestAssets: { assetId: string; amount: number }[];
      fee?: number;
    }) => {
      if (!window.chia || !isConnected) {
        throw new Error("Goby not connected");
      }
      return window.chia.request({
        method: "createOffer",
        params,
      });
    },
    [isConnected]
  );

  const signMessage = useCallback(
    async (message: string, publicKey: string): Promise<string | null> => {
      if (!window.chia || !isConnected) return null;
      try {
        const signature = await window.chia.request({
          method: "signMessage",
          params: { message, publicKey },
        });
        return signature as string;
      } catch (error) {
        console.error("Failed to sign message:", error);
        return null;
      }
    },
    [isConnected]
  );

  return (
    <GobyContext.Provider
      value={{
        isInstalled,
        isConnected,
        isConnecting,
        publicKeys,
        chainId,
        connect,
        disconnect,
        getBalance,
        takeOffer,
        createOffer,
        signMessage,
      }}
    >
      {children}
    </GobyContext.Provider>
  );
}

export function useGoby() {
  const context = useContext(GobyContext);
  if (!context) {
    throw new Error("useGoby must be used within a GobyProvider");
  }
  return context;
}
