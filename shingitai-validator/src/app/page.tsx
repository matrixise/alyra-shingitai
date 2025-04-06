"use client";
// import Image from "next/image";

import {Scanner, useDevices} from "@yudiel/react-qr-scanner";
import {useEffect, useState} from "react";

const ValidatorPage = () => {
    const devices = useDevices();
    useEffect(() => {
        console.log('Superman is great!');
    }, []);
  return (
      <>
        <h1>Hello <strong>Responsible, Fuck</strong></h1>
          <pre>{JSON.stringify(devices, null, 2)}</pre>
          <Scanner onScan={(result) => console.log(result)}
            onError={(error) => console.log(error) }/>
      </>
  )
}

export default function Home() {
  return (
      <ValidatorPage />
  );
}
