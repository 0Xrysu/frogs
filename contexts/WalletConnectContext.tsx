'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

// Hardcoded config for testing
const PROJECT_ID = 'cdf5ce5031c9867e13d9d38b478c8dd5';
const RELAY_URL = 'wss://relay.walletconnect.com';
const CHAIN_ID = 'chia:mainnet';

// Chia RPC methods
export enum ChiaMethod {
  // Wallet
  LogIn = 'chia_logIn',
  GetWallets = 'chia_getWallets',
  GetTransaction = 'chia_getTransaction',
  GetWalletBalance = 'chia_getWalletBalance',
  GetWalletBalances = 'chia_getWalletBalances',
  GetCurrentAddress = 'chia_getCurrentAddress',
  SendTransaction = 'chia_sendTransaction',
  SignMessageById = 'chia_signMessageById',
  SignMessageByAddress = 'chia_signMessageByAddress',
  VerifySignature = 'chia_verifySignature',
  GetNextAddress = 'chia_getNextAddress',
  GetSyncStatus = 'chia_getSyncStatus',
  // Offers
  GetAllOffers = 'chia_getAllOffers',
  GetOffersCount = 'chia_getOffersCount',
  CreateOfferForIds = 'chia_createOfferForIds',
  CancelOffer = 'chia_cancelOffer',
  CheckOfferValidity = 'chia_checkOfferValidity',
  TakeOffer = 'chia_takeOffer',
  // CATs
  GetCATWalletInfo = 'chia_getCATWalletInfo',
  GetCATAssetId = 'chia_getCATAssetId',
  SpendCAT = 'chia_spendCAT',
  AddCATToken = 'chia_addCATToken',
  // NFTs
  GetNFTs = 'chia_getNFTs',
  GetNFTInfo = 'chia_getNFTInfo',
  MintNFT = 'chia_mintNFT',
  TransferNFT = 'chia_transferNFT',
  GetNFTsCount = 'chia_getNFTsCount',
  // DIDs
  CreateNewDIDWallet = 'chia_createNewDIDWallet',
  SetDIDName = 'chia_setDIDName',
  SetNFTDID = 'chia_setNFTDID',
  GetNFTWalletsWithDIDs = 'chia_getNFTWalletsWithDIDs',
  // VCs
  GetVCs = 'chia_getVCs',
  AddVCProofs = 'chia_addVCProofs',
  GetProofsForRoot = 'chia_getProofsForRoot',
  RevokeVC = 'chia_revokeVC',
}

interface WalletConnectContextType {
  client: SignClient | null;
  session: SessionTypes.Struct | null;
  isConnecting: boolean;
  isConnected: boolean;
  uri: string;
  fingerprint: string | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  connect: () => Promise<void>;
  cancelConnect: () => void;
  disconnect: () => Promise<void>;
  request: <T>(method: ChiaMethod, params: Record<string, unknown>) => Promise<T>;
}

const WalletConnectContext = createContext<WalletConnectContextType | null>(null);

export function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }
  return context;
}

interface WalletConnectProviderProps {
  children: ReactNode;
}

export function WalletConnectProvider({ children }: WalletConnectProviderProps) {
  const [client, setClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [uri, setUri] = useState('');
  const [showModal, setShowModal] = useState(false);
  const initializing = useRef(false);

  const fingerprint = session?.namespaces?.chia?.accounts?.[0]?.split(':')[2] || null;
  const isConnected = !!session;

  // Initialize client
  useEffect(() => {
    if (initializing.current) return;
    initializing.current = true;

    const init = async () => {
      try {
        const signClient = await SignClient.init({
          projectId: PROJECT_ID,
          relayUrl: RELAY_URL,
          metadata: {
            name: 'Frogs Marketplace',
            description: 'NFT marketplace for Frogs collection on Chia',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://frogs.ink',
            icons: [typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : 'https://frogs.ink/icon.png'],
          },
        });

        // Check for existing session
        const sessions = signClient.session.getAll();
        if (sessions.length > 0) {
          const lastSession = sessions[sessions.length - 1];
          setSession(lastSession);
        }

        // Event listeners
        signClient.on('session_update', ({ topic, params }) => {
          const { namespaces } = params;
          const _session = signClient.session.get(topic);
          setSession({ ..._session, namespaces });
        });

        signClient.on('session_delete', () => {
          setSession(null);
        });

        signClient.on('session_expire', () => {
          setSession(null);
        });

        setClient(signClient);
      } catch (error) {
        console.error('Failed to initialize WalletConnect:', error);
      }
    };

    init();
  }, []);

  const cancelConnect = useCallback(() => {
    // Reset connection state so user can start a new connection
    setIsConnecting(false);
    setUri('');
  }, []);

  const connect = useCallback(async () => {
    if (!client) return;

    // Reset any previous state first
    setIsConnecting(true);
    setUri('');

    try {
      const { uri: connectionUri, approval } = await client.connect({
        optionalNamespaces: {
          chia: {
            methods: Object.values(ChiaMethod),
            chains: [CHAIN_ID],
            events: [],
          },
        },
      });

      if (connectionUri) {
        setUri(connectionUri);
      }

      const newSession = await approval();
      setSession(newSession);
      setShowModal(false);
    } catch (error) {
      // User cancelled or connection failed - reset state
      console.error('Failed to connect:', error);
      setUri('');
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!client || !session) return;

    try {
      await client.disconnect({
        topic: session.topic,
        reason: {
          code: 6000,
          message: 'User disconnected',
        },
      });
      setSession(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [client, session]);

  const request = useCallback(
    async <T,>(method: ChiaMethod, params: Record<string, unknown>): Promise<T> => {
      if (!client || !session) {
        throw new Error('Not connected');
      }

      let result: unknown;
      try {
        result = await client.request<unknown>({
          topic: session.topic,
          chainId: CHAIN_ID,
          request: {
            method,
            params: {
              fingerprint: fingerprint ? parseInt(fingerprint, 10) : undefined,
              ...params,
            },
          },
        });
      } catch (wcError: unknown) {
        if (wcError instanceof Error) {
          throw wcError;
        }
        if (wcError && typeof wcError === 'object') {
          const errObj = wcError as Record<string, unknown>;
          const message = errObj.message || errObj.reason || JSON.stringify(wcError);
          throw new Error(String(message));
        }
        throw new Error('Request rejected by wallet');
      }

      // Chia wallet returns null when user rejects the transaction
      if (result === null || result === undefined) {
        throw new Error('Transaction rejected by user');
      }

      // Check if result contains an error
      if (result && typeof result === 'object' && 'error' in result) {
        const errorResult = result as { error: unknown };
        const errorMessage = typeof errorResult.error === 'string' 
          ? errorResult.error 
          : typeof errorResult.error === 'object' && errorResult.error !== null
            ? JSON.stringify(errorResult.error)
            : 'Request rejected';
        throw new Error(errorMessage);
      }

      // Check for success: false pattern
      if (result && typeof result === 'object' && 'success' in result) {
        const successResult = result as { success: boolean; error?: unknown };
        if (!successResult.success) {
          throw new Error(successResult.error ? JSON.stringify(successResult.error) : 'Request failed');
        }
      }

      // Extract data from successful response
      if (result && typeof result === 'object' && 'data' in result) {
        return (result as { data: T }).data;
      }

      return result as T;
    },
    [client, session, fingerprint]
  );

  return (
    <WalletConnectContext.Provider
      value={{
        client,
        session,
        isConnecting,
        isConnected,
        uri,
        fingerprint,
        showModal,
        setShowModal,
        connect,
        cancelConnect,
        disconnect,
        request,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
}
