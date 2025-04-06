'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '@/constants';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { getAddress } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { gradeManagerAbi } from '@/generated';

const supabase = createClient(supabaseUrl!, supabaseKey!);

type Member = {
  id: string;
  created_at: string;
  firstname: string;
  lastname: string;
  email: string;
  wallet_address: string;
};

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'firstname', header: 'Firstname' },
  { accessorKey: 'lastname', header: 'Lastname' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'wallet_address', header: 'Wallet Address' },
];

type MemberForm = {
  firstname: string;
  lastname: string;
  email: string;
  wallet_address: string;
};

const wagmiContract = {
  address: process.env.NEXT_PUBLIC_GRADE_MANAGER_ADDRESS,
  abi: gradeManagerAbi,
};

const MemberNew = () => {
  const [showComponent, setShowComponent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    data: hash,
    error: errorWriteContract,
    isPending,
    writeContract,
  } = useWriteContract();

  const [form, setForm] = useState<MemberForm>({
    firstname: '',
    lastname: '',
    email: '',
    wallet_address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    const { name } = e.target;
    if (name == 'wallet_address') {
      value = getAddress(value);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      const response = await supabase.from('users').insert({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        wallet_address: getAddress(form.wallet_address),
      });
      writeContract({
        ...wagmiContract,
        functionName: 'addMember',
        args: [getAddress(form.wallet_address)],
      });
      console.log(response);
      setUploading(false);
      setShowComponent(false);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  return (
    <>
      {hash && <div>Transaction Hash: {hash}</div>}
      {errorWriteContract && <div>Error: {errorWriteContract.message}</div>}
      {isLoading && <div>Waiting for transaction to be mined</div>}
      {isSuccess && <div>Successfully minted</div>}

      {!showComponent && (
        <Button onClick={() => setShowComponent(true)}>+</Button>
      )}
      {showComponent && (
        <Button onClick={() => setShowComponent(false)}>-</Button>
      )}
      {error && <p>Error: {error}</p>}
      {showComponent && (
        <>
          <Input
            type="string"
            name="firstname"
            placeholder="Enter the name of the member"
            value={form.firstname}
            onChange={handleChange}
            required
          />
          <Input
            type="string"
            name="lastname"
            placeholder="Enter the date of the member"
            value={form.lastname}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Enter the email of the member"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            type="string"
            name="wallet_address"
            placeholder="Enter the wallet address of the member"
            value={form.wallet_address}
            onChange={handleChange}
            required
          />
          <Button onClick={handleSubmit} disabled={uploading && isPending}>
            Create the member
          </Button>
        </>
      )}
    </>
  );
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: records, error } = await supabase.from('users').select();
      if (error) throw error;
      setMembers(records || []);
    }
    fetchData();
  }, []);

  return (
    <>
      <h1>Members</h1>
      <div>
        <MemberNew />
      </div>
      {/*<pre>{JSON.stringify(members, null, 2)}</pre>*/}
      <DataTable columns={columns} data={members} />
    </>
  );
};

const MembersPage = () => {
  return <Members />;
};

export default MembersPage;
