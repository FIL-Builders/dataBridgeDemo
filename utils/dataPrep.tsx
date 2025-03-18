import { Piece } from '@web3-storage/data-segment';
import { importer } from 'ipfs-unixfs-importer';
import { base32 } from 'multiformats/bases/base32';
import { CID } from 'multiformats/cid';

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
      console.log('Generated CID:', file.cid.toString(base32));
      return file.cid;
    }

    throw new Error('No CID was generated for the file.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error replicating IPFS add:', error.message);
    } else {
      console.error('Unknown error replicating IPFS add');
    }
    throw error; // Re-throw the error to handle it in the calling function
  }
}

  //Generate Commp/Piece from a giving file
 export async function generateCommp(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    //Using the Piece Info because it returns legacy coding for CID
    const piece = Piece.fromPayload(bytes).toInfo();
    return piece;
  }
