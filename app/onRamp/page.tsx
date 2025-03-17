"use client"

import Header from "@components/header";
import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, File, Image, FileText, Check, X, UploadCloud } from 'lucide-react';
import { uploadToIPFS } from "./pinata";
import { generateCID, generateCommp, generateCAR} from "@/utils/dataPrep";
import { ethers } from "ethers";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ONRAMP_CONTRACT_ADDRESS, ONRAMP_CONTRACT_ABI } from "@components/contractDetails"
import { FiFile, FiUsers, FiHardDrive, FiDatabase } from 'react-icons/fi';

const WETH_ADDRESS = "0xb44cc5FB8CfEdE63ce1758CE0CDe0958A7702a16";

export default function OnRamp() {

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PINATA_CONFIGS = JSON.stringify({
    cidVersion: 1,
  });
  const PINATA_CLOUD_ROOT = "https://gateway.pinata.cloud/ipfs/";

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

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
    setLoading(true)
    if (file) {
      //Upload data to IPFS buffer using pinata
      //Todo: this is not correct. Need to upload CAR for Filecoin aggregation
      const data = new FormData();
      data.append("file", file);
      data.append("pinataOptions", PINATA_CONFIGS);
      console.log("Uploading")
      const response = await uploadToIPFS(data);
      const fileIPFSHash = response?.ipfsHash;
      const ipfsURL = `${PINATA_CLOUD_ROOT}${fileIPFSHash}`;

      //Preparing CID and piece info
      const cid = await generateCID(file);
      console.log("cid is ", cid.toString());
      const commP = await generateCommp(file);
      const pieceCid = commP.link.toString();
      console.log("piece CID is ", pieceCid);

      const pieceCidBytes = ethers.hexlify(commP.link.bytes);
      console.log("piece CID in bytes:", pieceCidBytes);

      const pieceSize = commP.size;
      console.log(`Padded Piece Size: ${commP.size} bytes`);

      // await generateCAR(file);
      //Making offer struct
      const offer = {
        commP: pieceCidBytes as `0x${string}`,
        size: BigInt(pieceSize),
        cid: cid.toString(),
        location: ipfsURL,
        amount: BigInt(0),
        token: WETH_ADDRESS as `0x${string}`,
      };
      console.log("offer is ", offer);

      try {
        writeContract({
          address: ONRAMP_CONTRACT_ADDRESS,
          abi: ONRAMP_CONTRACT_ABI,
          functionName: "offerData",
          args: [offer],
        });
        setLoading(false)
      } catch (error) {
        console.error("Error sending transaction:", error);
        setLoading(false)
      }

    } else {
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

      <div className="pt-16 bg-blue-600 h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Stats Section */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FiFile className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                      <dd className="text-3xl font-semibold text-gray-900">5</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Parameter Name</dt>
                      <dd className="text-3xl font-semibold text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <FiHardDrive className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                      <dd className="text-3xl font-semibold text-gray-900">4.2 GB</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FiDatabase className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Parameter Name</dt>
                      <dd className="text-3xl font-semibold text-gray-900">10 GB</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upload Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Upload Files</h3>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {loading || isPending || isConfirming || isConfirmed ? (
                  <>
                    <div className="flex flex-row gap-2 justify-center items-center">
                      {loading && <>
                        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.3s]"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]"></div>
                      </>}
                      {isPending && <p className="items-left text-sm text-blue-800">Transaction pending...</p>}
                      {isConfirming && <p className="items-left text-sm text-blue-800">Confirming transaction...</p>}
                      {/* {isConfirmed && hash && <p className="items-left text-sm text-blue-800">Transaction hash: {hash}</p>} */}
                      {isConfirmed && hash && <div className="flex justify-center items-center flex-col">
                        <img className="w-64 mb-16" src="https://cdn.vectorstock.com/i/500p/15/05/green-tick-checkmark-icon-vector-22691505.jpg" />
                        <div className="flex flex-col gap-2 w-full text-[10px] sm:text-xs z-50">
                          <div
                            className="succsess-alert cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px]"
                          >
                            <div className="flex gap-2">
                              <div className="text-[#2b9875] bg-white/5 backdrop-blur-xl p-1 rounded-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.5"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  ></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-white">Transaction hash</p>
                                <p className="text-gray-500">{hash}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>}
                    </div>
                  </>
                ) : (
                  <>
                    {!file ? (
                      <div
                        className={`flex justify-center border-2 border-dashed rounded-xl h-96 transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
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
                  </>
                )}

                {/* {file && (
                    <div className="bg-blue-50 px-6 py-3 border-t border-blue-100">
                      <div className="flex items-center gap-2">
                        {isPending && <p className="items-left text-sm text-blue-800">Transaction pending...</p>}
                        {isConfirming && <p className="items-left text-sm text-blue-800">Confirming transaction...</p>}
                        {isConfirmed && hash && <p className="items-left text-sm text-blue-800">Transaction hash: {hash}</p>}
                      </div>
                    </div>
                  )} */}
              </div>
            </div>

            {/* File List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Uploads</h3>
                <div className="mt-5">
                  <ul className="divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <li key={index} className="py-4 flex">
                        <div className="bg-gray-100 rounded-md p-2">
                          <FiFile className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3 flex flex-col flex-grow">
                          <span className="text-sm font-medium text-gray-900">
                            {['project_report.pdf', 'image_assets.zip', 'presentation.pptx', 'contract.docx', 'financial_data.xlsx'][index]}
                          </span>
                          <span className="text-sm text-gray-500">
                            {['2.5 MB', '8.2 MB', '4.7 MB', '1.2 MB', '3.8 MB'][index]} • Uploaded {['2 hours', '1 day', '3 days', '5 days', '1 week'][index]} ago
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                          <button type="button" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                            Action Button
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 text-center">
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View all files →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )

}