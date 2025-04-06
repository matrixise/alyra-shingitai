'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '@/constants';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount } from 'wagmi';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { participationSftAbi } from '@/generated';

const supabase = createClient(supabaseUrl!, supabaseKey!);

type Event = {
  created_at: string;
  date: string;
  description: string | null;
  id: string;
  max_nft: number;
  name: string;
};

const columns: ColumnDef<Event>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'max_nft', header: 'Max NFT' },
  { accessorKey: 'description', header: 'Description' },
];

type EventForm = {
  name: string;
  date: string;
  description: string;
};

const wagmiContract = {
  address: process.env.NEXT_PUBLIC_PARTICIPATION_SFT_ADDRESS,
  abi: participationSftAbi,
};

const EventNew = () => {
  const { address } = useAccount();
  const [showComponent, setShowComponent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    data: hash,
    error: errorWriteContract,
    isPending,
    writeContract,
  } = useWriteContract();

  const [form, setForm] = useState<EventForm>({
    name: '',
    date: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const date = new Date(form.date);
      setUploading(true);
      const response = await supabase.from('events').insert({
        name: form.name,
        date: form.date,
        max_nft: 1,
        description: form.description,
      });
      writeContract({
        ...wagmiContract,
        functionName: 'createEvent',
        args: [form.name, BigInt(date / 1000), [address]],
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

      <pre>{JSON.stringify(form)}</pre>

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
            name="name"
            placeholder="Enter the name of the event"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="date"
            placeholder="Enter the date of the event"
            value={form.date}
            onChange={handleChange}
            required
          />
          <Input
            type="string"
            name="description"
            placeholder="Enter the description of the event"
            value={form.description}
            onChange={handleChange}
            required
          />
          <Button onClick={handleSubmit} disabled={uploading && isPending}>
            Create the event
          </Button>
        </>
      )}
    </>
  );
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: events, error } = await supabase.from('events').select();
      if (error) throw error;
      return events;
    }

    fetchData().then((events) => setEvents(events || []));
  }, []);

  return (
    <>
      <h1>Events</h1>
      <div>
        <EventNew />
      </div>
      {/*<pre>{JSON.stringify(events, null, 2)}</pre>*/}
      <div>
        <DataTable columns={columns} data={events} />
      </div>
    </>
  );
};

const EventsPage = () => {
  return <Events />;
};

export default EventsPage;
