import { CID } from "multiformats/cid";
import { base32 } from 'multiformats/bases/base32';
import { importer } from 'ipfs-unixfs-importer';
import { Piece } from "@web3-storage/data-segment";
import { CarWriter } from '@ipld/car';

// Generate a CID using sha256
export async function generateCID(file: File): Promise<CID> {
    try {
      const blockstore = {
        store: new Map<string, Uint8Array>(),
        async put(cid: CID, bytes: Uint8Array) {
          this.store.set(cid.toString(), bytes);
          return cid;
        },
        async get(cid: CID) {
          return this.store.get(cid.toString());
        },
      };
  
      const options = {
        maxChunkSize: 262144, // 256 KB chunk size
        rawLeaves: true, // Use DAG-PB encoding (not raw leaves)
      };
  
      const fileContents = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileContents);
  
      const source = [{ content: uint8Array }]; // Use Uint8Array instead of ReadableStream
  
      for await (const file of importer(source, blockstore, options)) {
        console.log("Generated CID:", file.cid.toString(base32));
        return file.cid;
      }
  
      throw new Error("No CID was generated for the file.");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error replicating IPFS add:", error.message);
      } else {
        console.error("Unknown error replicating IPFS add");
      }
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

  //Todo: this seems not correct because it generates commp directly from File.
  // commp should be generated from CAR format
 export async function generateCommp(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    //Using the Piece Info because it returns legacy coding for CID
    const piece = Piece.fromPayload(bytes).toInfo();
    return piece;
  }

  // Experimenting the process of converting from
  // File => CAR => commP
export async function generateCAR(file: File) {
  try {
    const blockstore = {
      store: new Map<string, Uint8Array>(),
      async put(cid: CID, bytes: Uint8Array) {
        this.store.set(cid.toString(), bytes);
        return cid;
      },
      async get(cid: CID) {
        return this.store.get(cid.toString());
      },
    };
    //Step 1: Convert File to Uint8Array
    const fileContents = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileContents);

    const source = [{ content: uint8Array }]; // Use Uint8Array instead of ReadableStream
    const options = {
      maxChunkSize: 262144, // 256 KB chunk size
      rawLeaves: true, // Use DAG-PB encoding (not raw leaves)
    };

    //Step 2: Convert File to UnixFS DAG
    const entries = importer(source, blockstore, options);
    let rootCID: CID | null = null;
    const blocks = [];

    // Store data in blockstore & collect blocks
    for await (const entry of entries) {
      rootCID = entry.cid;
      const blockData = await blockstore.get(entry.cid);
      if (blockData) {
          blocks.push({ cid: entry.cid, bytes: blockData });
      }
    }

    if (!rootCID) {
        throw new Error("❌ No valid root CID was generated!");
    }
    console.log(`✅ Generated Root CID: ${rootCID.toString()}`);

    // Step 3: Create CAR File In-Memory
    const { writer, out } = CarWriter.create([rootCID]);
    const carChunks: Uint8Array[] = [];

    for (const block of blocks) {
        writer.put(block);
    }
    await writer.close();  // Close after writing

    for await (const chunk of out) {
        carChunks.push(chunk);
    }

    const carBuffer = new Uint8Array(Buffer.concat(carChunks));
    console.log(`✅ Generated in-memory CAR file (Size: ${carBuffer.length} bytes)`);

    // Step 4: Compute CommP (PieceCID) for Filecoin
    const piece = Piece.fromPayload(carBuffer);
    console.log(`✅ Generated CommP (PieceCID): ${piece.link.toString()}`);
    console.log(`🔹 Padded Piece Size: ${piece.size} bytes`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error replicating IPFS add:", error.message);
    } else {
      console.error("Unknown error replicating IPFS add");
    }
    throw error; // Re-throw the error to handle it in the calling function
  }
}