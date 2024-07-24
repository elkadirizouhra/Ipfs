// src/app/page.js
'use client';

import React, { useState } from 'react';
import FileUpload from './upload';
import FileRetrieve from './Retrieve';

export default function HomePage() {
  const [cid, setCid] = useState(null);

  return (
    <div>
      <h1>Upload and Retrieve File from IPFS</h1>
      <FileUpload onUpload={setCid} />
      <FileRetrieve />
    </div>
  );
}
