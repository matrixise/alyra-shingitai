'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount } from 'wagmi';

const MemberPage = () => {
  const { address, isConnected } = useAccount();
  if (!isConnected) return <div>Not connected</div>;
  return (
    <>
      <div className="bg-white">
        <h1>Scan Me</h1>
        <div className="p-10">
          <QRCodeSVG value={address!} />
        </div>
      </div>
    </>
  );
};
export default function Home() {
  return <MemberPage />;
}
