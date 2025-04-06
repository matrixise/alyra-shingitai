'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
  return (
    <div className="bg-[#102A43] text-white flex justify-between items-center p-5">
      <div className=" flex justify-between items-center gap-5">
        <p className="text-lg">Shin Gi Tai Member</p>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/participations">Participations</Link>
          </li>
          <li>
            <Link href="/grades">Grades</Link>
          </li>
        </ul>
      </div>
      <div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </div>
  );
};

export default Header;
