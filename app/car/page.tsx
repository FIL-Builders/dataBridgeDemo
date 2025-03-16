"use client";

import React, { useState } from "react";
import { CarWriter } from "@ipld/car";
import { importer } from "ipfs-unixfs-importer";
import all from "it-all";
import { CID } from "multiformats/cid";

class MemoryBlockstore {
  constructor() {
    this.store = new Map();
    this.blocks = [];
  }

  put = async (cid, bytes) => {
    console.log(
      "[MemoryBlockstore.put] CID:",
      cid.toString(),
      "Bytes:",
      bytes?.length,
    );
    this.store.set(cid.toString(), bytes);
    this.blocks.push({ cid, bytes });
    return cid;
  };

  get = async (cid) => {
    console.log("[MemoryBlockstore.get] CID:", cid.toString());
    return this.store.get(cid.toString());
  };
}

export default function CreateCarFileUploader() {
  const [carFileUrl, setCarFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [rootCidString, setRootCidString] = useState(null);

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      console.log("Selected file:", file.name);

      const fileEntry = {
        path: file.name,
        content: file.stream(),
      };

      const blockstore = new MemoryBlockstore();

      const blocks = [];
      let rootCID = null;
      console.log("Starting import...");
      for await (const entry of importer(fileEntry, blockstore, {
        wrapWithDirectory: false,
      })) {
        console.log("Imported entry CID:", entry.cid.toString());
        const bytes = await blockstore.get(entry.cid);
        if (!bytes) {
          console.error("No bytes found for block", entry.cid.toString());
          throw new Error("Missing bytes for CID: " + entry.cid.toString());
        }
        blocks.push({ cid: entry.cid, bytes });
        rootCID = entry.cid;
      }

      console.log(blockstore.blocks);
      if (!rootCID) throw new Error("No root CID generated");
      console.log("Root CID (represents file DAG):", rootCID.toString());
      setRootCidString(rootCID.toString());

      console.log("Creating CAR file...");
      const { writer, out } = await CarWriter.create([rootCID]);
      const outReader = (async () => {
        const carChunks = [];
        for await (const chunk of out) {
          console.log("Read CAR chunk of size:", chunk.length);
          carChunks.push(chunk);
        }
        const carBlob = new Blob(carChunks, {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(carBlob);
        console.log("CAR file URL generated.");
        setCarFileUrl(url);
      })();

      for (const block of blockstore.blocks) {
        console.log(
          "About to write block:",
          block.cid.toString(),
          block.bytes?.length,
        );
        if (!block.bytes || !(block.bytes instanceof Uint8Array)) {
          console.error("Invalid block bytes for CID:", block.cid.toString());
          throw new Error(
            "Invalid block data for CID: " + block.cid.toString(),
          );
        }
        await writer.put({ cid: block.cid, bytes: block.bytes });
        console.log("Block written to CAR:", block.cid.toString());
      }

      await writer.close();
      await outReader;
    } catch (err) {
      console.error("Error during CAR file generation:", err);
      setError(err.message);
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-xl border max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload File to Create CAR</h2>
      <input type="file" onChange={handleFileUpload} className="mb-4" />
      {carFileUrl && (
        <>
          <a
            href={carFileUrl}
            download="file.car"
            className="block mt-2 text-blue-500 underline"
          >
            Download CAR File
          </a>
          {rootCidString && (
            <p className="mt-2 text-sm text-gray-700">
              Root CID (of file DAG):{" "}
              <code className="break-all">{rootCidString}</code>
            </p>
          )}
        </>
      )}
      {error && <p className="text-red-600 mt-2">Error: {error}</p>}
    </div>
  );
}
