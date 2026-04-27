'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWalletConnect } from '@/contexts/WalletConnectContext';
import { useGoby } from '@/contexts/GobyContext';
import { FiX, FiCopy, FiCheck, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import QRCode from 'qrcode';

type WalletView = 'select' | 'walletconnect';

export function WalletSelectModal() {
  const {
    showModal,
    setShowModal,
    uri,
    isConnecting: wcConnecting,
    isConnected: wcConnected,
    disconnect: wcDisconnect,
    connect: wcConnect,
    cancelConnect: wcCancelConnect,
  } = useWalletConnect();

  const {
    isInstalled: gobyInstalled,
    isConnected: gobyConnected,
    isConnecting: gobyConnecting,
    connect: gobyConnect,
    disconnect: gobyDisconnect,
  } = useGoby();

  const [view, setView] = useState<WalletView>('select');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Always show select view when modal opens
  useEffect(() => {
    if (showModal) {
      setView('select');
    }
  }, [showModal]);

  // Generate QR code when URI changes
  useEffect(() => {
    if (uri) {
      QRCode.toDataURL(uri, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(setQrCodeData)
        .catch(console.error);
    }
  }, [uri]);

  const copyToClipboard = useCallback(async () => {
    if (!uri) return;
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [uri]);

  const handleWalletConnectToggle = useCallback(async () => {
    // Prevent connecting if Goby is already connected
    if (gobyConnected && !wcConnected) return;
    
    if (wcConnected) {
      // Disconnect
      await wcDisconnect();
    } else {
      // Connect - show QR view
      setView('walletconnect');
      wcCancelConnect();
      wcConnect();
    }
  }, [wcConnect, wcConnected, wcCancelConnect, wcDisconnect, gobyConnected]);

  const handleGobyToggle = useCallback(async () => {
    // Prevent connecting if WalletConnect is already connected
    if (wcConnected && !gobyConnected) return;
    
    if (gobyConnected) {
      // Disconnect
      gobyDisconnect();
    } else {
      // Connect
      await gobyConnect();
    }
  }, [gobyConnect, gobyConnected, gobyDisconnect, wcConnected]);

  

  const handleClose = useCallback(() => {
    // Cancel any pending WalletConnect connection when closing modal
    if (wcConnecting) {
      wcCancelConnect();
    }
    setShowModal(false);
  }, [wcConnecting, wcCancelConnect, setShowModal]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleBack = useCallback(() => {
    // Cancel any pending WalletConnect connection and reset state
    if (wcConnecting) {
      wcCancelConnect();
    }
    setView('select');
  }, [wcConnecting, wcCancelConnect]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {view !== 'select' && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {view === 'select' && 'Connect Wallet'}
              {view === 'walletconnect' && 'WalletConnect'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Wallet Selection View */}
          {view === 'select' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Choose a wallet to connect
              </p>

              {/* Goby Wallet Option */}
              <div className={`flex items-center gap-4 w-full p-4 bg-muted/50 border border-border rounded-xl ${wcConnected ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <img src="/goby.svg" alt="Goby" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Goby Wallet</p>
                </div>
                {gobyInstalled ? (
                  <button
                    onClick={handleGobyToggle}
                    disabled={gobyConnecting || wcConnected}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      gobyConnected ? 'bg-green-500' : 'bg-muted-foreground/30'
                    } ${gobyConnecting ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        gobyConnected ? 'translate-x-6' : 'translate-x-0'
                      } ${gobyConnecting ? 'animate-pulse' : ''}`}
                    />
                  </button>
                ) : (
                  <a
                    href="https://www.goby.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    <FiExternalLink size={18} className="text-muted-foreground" />
                  </a>
                )}
              </div>

              {/* WalletConnect Option */}
              <div className={`flex items-center gap-4 w-full p-4 bg-muted/50 border border-border rounded-xl ${gobyConnected ? 'opacity-50' : ''}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <img src="/wc.svg" alt="WalletConnect" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">WalletConnect</p>
                </div>
                <button
                  onClick={handleWalletConnectToggle}
                  disabled={wcConnecting || gobyConnected}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    wcConnected ? 'bg-green-500' : 'bg-muted-foreground/30'
                  } ${wcConnecting ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      wcConnected ? 'translate-x-6' : 'translate-x-0'
                    } ${wcConnecting ? 'animate-pulse' : ''}`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* WalletConnect View - QR Code */}
          {view === 'walletconnect' && (
            <>
              {wcConnecting && uri ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Scan with your Chia wallet app
                  </p>
                  {qrCodeData ? (
                    <div className="bg-white p-3 rounded-xl">
                      <img
                        src={qrCodeData}
                        alt="WalletConnect QR Code"
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                  ) : (
                    <div className="w-[280px] h-[280px] bg-muted rounded-xl animate-pulse" />
                  )}
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      Or copy the connection link
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors"
                    >
                      {copied ? (
                        <>
                          <FiCheck size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy size={16} />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : wcConnecting ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-12 h-12 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Initializing connection...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Click connect to scan QR code with your wallet
                  </p>
                  <button
                    onClick={() => wcConnect()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-lg font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              )}
            </>
          )}

          
        </div>

        {/* Footer */}
        {view === 'select' && (
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground text-center">
              Connect your Chia wallet to interact with the marketplace
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
