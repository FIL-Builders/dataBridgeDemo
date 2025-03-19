export const ONRAMP_CONTRACT_ADDRESS = '0xeE857540dddB6E6EA10a5c84f57562F11D5Fb47D';

export const ONRAMP_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'aggId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'commP',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64[]',
        name: 'offerIDs',
        type: 'uint64[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'payoutAddr',
        type: 'address',
      },
    ],
    name: 'AggregatonCommitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'commP',
            type: 'bytes',
          },
          {
            internalType: 'uint64',
            name: 'size',
            type: 'uint64',
          },
          {
            internalType: 'string',
            name: 'location',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'contract IERC20',
            name: 'token',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct OnRampContract.Offer',
        name: 'offer',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'id',
        type: 'uint64',
      },
    ],
    name: 'DataReady',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes',
        name: 'commP',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'dealID',
        type: 'uint64',
      },
    ],
    name: 'ProveDataStored',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'aggregationPayout',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'aggregations',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'commPToAggregateID',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'commP',
        type: 'bytes',
      },
      {
        internalType: 'uint64[]',
        name: 'claimedIDs',
        type: 'uint64[]',
      },
      {
        components: [
          {
            internalType: 'uint64',
            name: 'index',
            type: 'uint64',
          },
          {
            internalType: 'bytes32[]',
            name: 'path',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct PODSIVerifier.ProofData[]',
        name: 'inclusionProofs',
        type: 'tuple[]',
      },
      {
        internalType: 'address',
        name: 'payoutAddr',
        type: 'address',
      },
    ],
    name: 'commitAggregate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'dataProofOracle',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'commP',
            type: 'bytes',
          },
          {
            internalType: 'uint64',
            name: 'size',
            type: 'uint64',
          },
          {
            internalType: 'string',
            name: 'location',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'contract IERC20',
            name: 'token',
            type: 'address',
          },
        ],
        internalType: 'struct OnRampContract.Offer',
        name: 'offer',
        type: 'tuple',
      },
    ],
    name: 'offerData',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'offers',
    outputs: [
      {
        internalType: 'bytes',
        name: 'commP',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: 'size',
        type: 'uint64',
      },
      {
        internalType: 'string',
        name: 'location',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'contract IERC20',
        name: 'token',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'commP',
            type: 'bytes',
          },
          {
            internalType: 'int64',
            name: 'duration',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'dealID',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'status',
            type: 'uint256',
          },
        ],
        internalType: 'struct DataAttestation',
        name: 'attestation',
        type: 'tuple',
      },
    ],
    name: 'proveDataStored',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'provenAggregations',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'oracle_',
        type: 'address',
      },
    ],
    name: 'setOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'index',
            type: 'uint64',
          },
          {
            internalType: 'bytes32[]',
            name: 'path',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct PODSIVerifier.ProofData',
        name: 'proof',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'leaf',
        type: 'bytes32',
      },
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'aggID',
        type: 'uint64',
      },
      {
        internalType: 'uint256',
        name: 'idx',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: 'offerID',
        type: 'uint64',
      },
    ],
    name: 'verifyDataStored',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
