"use client"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { useEffect } from 'react';

export const NavbarWalletComponent = () => {

    const { address } = useAccount();
    const { data: balance } = useBalance({ address });

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openChainModal,
                openConnectModal,
                openAccountModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (connected) {

                                if (chain.unsupported) {
                                    return (
                                        <button onClick={openChainModal} className="text-black items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-[20px] shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-2 lg:text-xl px-8 py-2">
                                            Wrong network
                                        </button>
                                    );
                                }
                                return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div className="text-black items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-[20px] shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-2 lg:text-xl px-8 py-2">

                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <button
                                                    onClick={openChainModal}
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                    type="button"
                                                >
                                                    {chain.hasIcon && (
                                                        <div
                                                            style={{
                                                                background: chain.iconBackground,
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: 999,
                                                                overflow: 'hidden',
                                                                marginRight: 4,

                                                            }}
                                                        >
                                                            {chain.iconUrl && (
                                                                <img
                                                                    alt={chain.name ?? 'Chain icon'}
                                                                    src={chain.iconUrl}
                                                                    style={{ width: 20, height: 20 }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    {chain.name}
                                                </button>
                                                |
                                                <button onClick={openAccountModal} type="button">
                                                    {account.displayName}
                                                    {account.displayBalance
                                                        ? ` (${account.displayBalance})`
                                                        : ''}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                );
                            }
                        })()}
                    </div>


                );
            }}
        </ConnectButton.Custom>
    );
};