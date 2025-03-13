"use client"

import Footer from "@components/footer";
import Header from "@components/header";
import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, File, Image, FileText, Check, X, UploadCloud } from 'lucide-react';
import { uploadToIPFS } from "./pinata";
import {generateCID, generatePiece } from "@/utils/dataPrep";
import { ethers } from "ethers";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {ONRAMP_CONTRACT_ADDRESS, ONRAMP_CONTRACT_ABI} from "@components/contractDetails"

const WETH_ADDRESS = "0xb44cc5FB8CfEdE63ce1758CE0CDe0958A7702a16";

export default function OnRamp() {

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PINATA_CONFIGS = JSON.stringify({
    cidVersion: 1,
  });
  const PINATA_CLOUD_ROOT = "https://gateway.pinata.cloud/ipfs/";

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // const uploadedFiles = [
  //   {
  //     "name": "FileOne.png",
  //     "size": "921 MB",
  //   },
  //   {
  //     "name": "FileTwo.png",
  //     "size": "921 MB",
  //   },
  //   {
  //     "name": "FileThree.png",
  //     "size": "921 MB",
  //   }
  // ]

  const handleFileChange = (selectedFile: File) => {
    // Reset states
    setError(null);
    setFile(selectedFile);

    // Create preview URL for images
    if (selectedFile.type.startsWith('image/')) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
      setTextContent('');
    }
    // Handle text files
    else if (
      selectedFile.type === 'text/plain' ||
      selectedFile.type === 'text/html' ||
      selectedFile.type === 'text/css' ||
      selectedFile.type === 'text/javascript' ||
      selectedFile.type === 'application/json'
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setTextContent(result);
          setPreviewUrl(null);
        }
      };
      reader.readAsText(selectedFile);
    }
    // Other file types
    else {
      setPreviewUrl(null);
      setTextContent('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setTextContent('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (file) {
      //Upload data to IPFS buffer using pinata
      const data = new FormData();
      data.append("file", file);
      data.append("pinataOptions", PINATA_CONFIGS);
      const response = await uploadToIPFS(data);
      const fileIPFSHash = response?.ipfsHash;
      const ipfsURL = `${PINATA_CLOUD_ROOT}${fileIPFSHash}`;

      //Preparing CID and piece info
      const cid = await generateCID(file);
      console.log("cid is ", cid.toString());
      const piece = await generatePiece(file);
      const pieceCid = piece.link.toString();
      console.log("piece is ", piece.link.bytes);
      console.log("piece CID is ", pieceCid);

      const pieceCidBytes = ethers.hexlify(piece.link.bytes);
      console.log("piece CID in bytes:", pieceCidBytes);

      const pieceSize = piece.padding;

      //Making offer struct
      const offer = {
        commP: pieceCidBytes as `0x${string}`,
        size: BigInt(pieceSize),
        cid: cid.toString(),
        location: ipfsURL,
        amount: BigInt(0),
        token: WETH_ADDRESS as `0x${string}`,
      };
      console.log("offer is ",offer);

      try {
        writeContract({
          address: ONRAMP_CONTRACT_ADDRESS,
          abi: ONRAMP_CONTRACT_ABI,
          functionName: "offerData",
          args: [offer],
        });
      } catch (error) {
        console.error("Error sending transaction:", error);
      }

    }else {
      setError("No file is uploaded.");
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (): JSX.Element => {
    if (!file) return <Upload className="w-8 h-8 text-blue-500" />;

    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-purple-500" />;
    } else if (
      file.type === 'text/plain' ||
      file.type === 'text/html' ||
      file.type === 'text/css' ||
      file.type === 'text/javascript' ||
      file.type === 'application/json'
    ) {
      return <FileText className="w-8 h-8 text-yellow-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-blue-500" />;
    }
  };


  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-blue-600 flex justify-center items-center p-2">
        <div className="flex flex-row gap-8 items-center">
          {/* UPLAOD SECTION */}
          <div className="min-h-screen flex items-center justify-center text-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
              <div className="p-6 px-20">
                <h1 className="text-2xl font-bold text-gray-800 mb-1 py-4">Store Data to Filecoin</h1>


                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                      }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center gap-3 cursor-pointer">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <UploadCloud className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          <span className="text-blue-500">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports all file types
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        {getFileIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type || "Unknown type"}</span>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* File Preview */}
                    <div className="preview-container">
                      {previewUrl && (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={previewUrl}
                            alt="File preview"
                            className="w-full h-auto object-contain max-h-64"
                          />
                        </div>
                      )}

                      {textContent && (
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                          <pre className="p-4 bg-gray-50 text-sm text-gray-800 overflow-x-auto max-h-64">
                            {textContent}
                          </pre>
                        </div>
                      )}

                      {!previewUrl && !textContent && (
                        <div className="rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
                          {getFileIcon()}
                          <p className="mt-2 text-sm text-gray-500">No preview available</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleRemoveFile}
                        className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleUpload}
                        className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              

              {file && (
                <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-blue-800">File ready to be stored on Filecoin</p>
                  </div>
                </div>
              )}

              {file && (
                <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
                  <div className="flex items-center gap-2">
                    {isPending && <p className="items-left text-sm text-blue-800">Transaction pending...</p>}
                    {isConfirming && <p className="items-left text-sm text-blue-800">Confirming transaction...</p>}
                    {isConfirmed && hash && <p className="items-left text-sm text-blue-800">Transaction hash: {hash}</p>}
                  </div>
                </div>
              )}
                    
            </div>
          </div>
          {/* LIST OF FILES */}
          {/* { <div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {file?.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatFileSize(file?.size)}</span>
                    <span>•</span>
                    <span>{file?.type || "Unknown type"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div> } */}
        </div>

      </div>
      <Footer />
    </>
  )

}