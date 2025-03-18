import { WalletConnect } from '@/components/walletConnect';

import Footer from '../components/footer';
import Header from '../components/header';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-blue-600">
      <Header />
      <div>
        <div
          className="relative w-full pt-48 pb-40 m-auto flex justify-center text-center flex-col items-center z-1 text-white"
          style={{ maxWidth: '1200px' }}
        >
          <h1 className="inline-block max-w-2xl lg:max-w-4xl  w-auto relative text-5xl md:text-6xl lg:text-7xl tracking-tighter mb-10 font-bold">
            Cross-Chain Data Storage on Filecoin{' '}
          </h1>
          <p className="text-xl mb-5">Effortlessly bridge your data to Filecoin from Avalanche</p>
          <WalletConnect />
        </div>
      </div>
      <Footer />
    </div>
  );
}
