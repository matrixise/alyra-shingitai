import React from 'react';

interface AddressDisplayProps {
  address: string;
  size?: number;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  size = 4,
  className = '',
}) => {
  if (!address) return <span className={className}>–</span>;

  const truncated = `${address.slice(0, 2 + size)}...${address.slice(-size)}`;

  return <span className={className}>{truncated}</span>;
};
