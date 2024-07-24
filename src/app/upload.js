"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { create } from "ipfs-http-client";
import FileStorageContract from "/build/contracts/FileStorage.json";

const client = create({
  host: "172.27.2.96", // Remplacez par l'adresse de votre nœud privé
  port: 5001, // Remplacez par le port de votre nœud privé
  protocol: "http", // Utilisez 'http' pour les nœuds locaux
});

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);
  const [error, setError] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileInfo, setFileInfo] = useState(null);

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = FileStorageContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          FileStorageContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(instance);
      } else {
        setError("Please install MetaMask to use this app.");
      }
    }
    initWeb3();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setError("Please select a file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        const added = await client.add(buffer);
        const extension =
          getFileExtension(file.name) ||
          getFileExtensionFromMimeType(file.type);
        const cidWithMetadata = `${added.cid.toString()}?${extension},${
          file.name.split(".")[0]
        }`;
        setCid(cidWithMetadata);

        await contract.methods
          .uploadFile(added.cid.toString(), file.name, file.type, file.size)
          .send({ from: accounts[0] });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await contract.methods
        .getFileByName(accounts[0], fileName)
        .call();
      setFileInfo(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  const getFileExtensionFromMimeType = (mime) => {
    switch (mime) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "application/pdf":
        return "pdf";
      default:
        return "bin";
    }
  };

  return (
    <div>
      <h1>Upload File to IPFS</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {cid && (
        <div>
          <p>File uploaded successfully:</p>
          <p>CID with Metadata: {cid}</p>
          <p>File Name: {file.name}</p>
          <p>File Size: {file.size} bytes</p>
          <p>File Type: {file.type}</p>
        </div>
      )}
      {error && <p>Error: {error}</p>}

      <h2>Search File by Name</h2>
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {fileInfo && (
        <div>
          <p>File CID: {fileInfo}</p>
        </div>
      )}
    </div>
  );
}
