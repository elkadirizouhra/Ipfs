'use client';

import { useState } from "react";
import { create } from "ipfs-http-client";

const client = create({
  host: '172.27.2.96', // Remplacez par l'adresse de votre nœud privé
  port: 5001, // Remplacez par le port de votre nœud privé
  protocol: 'http', // Utilisez 'http' pour les nœuds locaux
});

export default function Retrieve() {
  const [cidWithMetadata, setCidWithMetadata] = useState("");
  const [retrievedFile, setRetrievedFile] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setCidWithMetadata(e.target.value);
  };

  const retrieveFile = async (cid, onProgress) => {
    const chunks = [];
    let fileType = "application/octet-stream";

    for await (const chunk of client.cat(cid)) {
      chunks.push(chunk);
    }

    const fileBlob = new Blob(chunks, { type: fileType });
    return { fileBlob, fileType };
  };

  const onRetrieve = async () => {
    try {
      const [cid, metadata] = cidWithMetadata.split("?");
      const [extension,name]=metadata.split(",")
      
      
    

      if (!metadata) {
        setError("Invalid CID with metadata format.");
        return;
      }

      const params = new URLSearchParams(metadata);
    //   const extension = params.get('type')?.replace(/"/g, '');
    //   const name = params.get('name')?.replace(/"/g, '');

      if (!extension || !name) {
        setError("Metadata missing type or name.");
        return;
      }

      const { fileBlob, fileType } = await retrieveFile(cid, (evt) => {
        console.info("cat event", evt.type, evt.detail);
      });

      if (fileBlob) {
        const fileName = `${name}.${extension}`;
        setRetrievedFile({ fileBlob, fileName });
      } else {
        setError("File not found or could not be retrieved.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const onDownload = () => {
    if (retrievedFile) {
      const { fileBlob, fileName } = retrievedFile;
      const url = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <h1>Retrieve File from IPFS</h1>
      <input
        type="text"
        placeholder="Enter CID with Metadata"
        onChange={onChange}
      />
      <button onClick={onRetrieve}>Retrieve</button>
      {retrievedFile && (
        <div>
          <p>File retrieved successfully:</p>
          <button onClick={onDownload}>Download File</button>
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
      }
