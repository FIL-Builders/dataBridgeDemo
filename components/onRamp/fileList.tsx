// components/FileList.tsx
import React from 'react';
import { FiFile, FiCheckCircle } from 'react-icons/fi';

const FileList = () => {
  return (
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
                            {['2.5 MB', '8.2 MB', '4.7 MB', '1.2 MB', '3.8 MB'][index]} • Uploaded {['10 minutes', '30 minutes', '2 hours', '5 hours', '1 day'][index]} ago
                          </span>
                        </div>
                        {index < 3 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <FiCheckCircle className="h-4 w-4 mr-1" /> Verified
                          </span>
                        )}
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
  );
};

export default FileList;
