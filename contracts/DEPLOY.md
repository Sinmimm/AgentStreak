# DEPLOY.md — AgentStreak

> **Status: BELUM DI-DEPLOY.** Dokumen ini berisi semua artefak yang dibutuhkan
> untuk deploy manual + verifikasi. TIDAK ADA transaksi on-chain yang dikirim
> selama pengembangan ini. Deploy dilakukan nanti, hanya atas perintah user,
> via Agentic Wallet.

## 1. Ringkasan

| Item | Nilai |
|---|---|
| Kontrak | `AgentStreak` (ERC721 soulbound, "AgentStreak" / "ASTRK") |
| Source | `src/AgentStreak.sol` (Solidity **0.8.30**, `pragma solidity 0.8.30` — exact) |
| Chain | BNB Chain, chain id **56** |
| Constructor | 1 arg: `agentId_` (address) — lihat §2 |
| Constructor args lain | **TIDAK ADA** |
| Nilai deploy (value) | **0 BNB** |
| Gas limit rekomendasi | **2.000.000** |
| Gas deploy terukur | ~1.830.601–1.873.665 (tx, incl. 21.000 intrinsic) |
| Biaya deploy @ 0,05 gwei\* | ~**0,0000915–0,0000937 BNB** |
| Biaya deploy @ 0,1 gwei | ~0,000183–0,000187 BNB |
| Ukuran runtime code | 7.770 byte (< batas 24.576 byte) |
| Optimizer | **enabled, runs 200** |
| EVM version | **cancun** |
| Via-IR | **tidak** (build standar — lihat catatan di README) |
| License | MIT |
| Dependensi | OpenZeppelin Contracts **v5.4.0**, forge-std |

\* Harga gas BSC live 0,05 gwei (`eth_gasPrice` = 50.000.000 wei, dicek
18 Nov 2026 ~21:30 WIB di `bsc-dataseed.binance.org` dan
`bsc-dataseed1.defibit.io` — keduanya sama). Cek ulang harga gas sesaat
sebelum deploy; bila memakai 0,1 gwei, biaya ~2x angka di atas.

## 2. Constructor

Satu-satunya constructor arg adalah alamat kontrak Agent ID:

| Parameter | Nilai |
|---|---|
| `agentId_` | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (SPACE ID Agent ID, BNB Chain) |

ABI-encoded constructor arg (32 byte, alamat di-right-align):

```text
00000000000000000000000060b9262456de011f7d15a54cdd8c48baaa8b022f
```

Alamat wallet pemilik proyek (hanya dokumentasi — BUKAN argumen constructor,
BUKAN penerima dana): `0x634f2cB9bbE400859d6372094eD656Ae65D5e2f6`
(Agent ID `mallizyyy.ai`).

## 3. ABI (JSON)

File: `artifacts/AgentStreak.abi.json` (41 entri: 24 fungsi, 4 event, 13 error).

```json
[
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "agentId_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "SECONDS_PER_DAY",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "agentId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IAgentID"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "badgeOf",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "canCheckInToday",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "checkIn",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "currentDay",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApproved",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lastCheckInDay",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextCheckInIn",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "safeTransferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setApprovalForAll",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "streakOf",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4",
        "internalType": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalCheckIns",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalUsers",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ApprovalForAll",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CheckIn",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "day",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "streak",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalCheckIns",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyCheckedInToday",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ERC721IncorrectOwner",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InsufficientApproval",
    "inputs": [
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidApprover",
    "inputs": [
      {
        "name": "approver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidOperator",
    "inputs": [
      {
        "name": "operator",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidReceiver",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721InvalidSender",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC721NonexistentToken",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotAgentIDHolder",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Soulbound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroAgentIDAddress",
    "inputs": []
  }
]
```

## 4. Bytecode & init code

| Artefak | File | Panjang | SHA-256 |
|---|---|---|---|
| Creation code | `artifacts/AgentStreak.bytecode.txt` | 8394 byte | `626050ec2084fcf8b0417fbf76ef34432593d8eeb7c3070a3cdcea833cf2908b` |
| Runtime code | `artifacts/AgentStreak.deployedBytecode.txt` | 7770 byte | `de958079a0c97e186aac27c1fb3414908ba0d3f7a4d229ff4522399a5f09616f` |
| Init code (= creation + constructor arg) | `artifacts/AgentStreak.initcode.txt` | 8426 byte | `96655418dd77c8ed5ca97f4dc32d6b91d8c09f6a80e6de059886fa27bb02ea62` |
| Constructor arg | `artifacts/AgentStreak.constructorArgs.txt` | 32 byte | — |

Creation code (awal / akhir — lengkapnya di file):

```text
awal : 0x60a06040526001600a55348015610014575f5ffd5b506040516120ca38038061
akhir: ...a75d834ea943078d2a754a5a0b69855efb4fba39b4d764736f6c634300081e0033
```

### Init code lengkap (siap tempel ke tool deploy — `to` kosong, `value` 0)

```text
0x60a06040526001600a55348015610014575f5ffd5b506040516120ca3803806120ca833981016040819052610033916100cb565b6040518060400160405280600b81526020016a4167656e7453747265616b60a81b81525060405180604001604052806005815260200164415354524b60d81b815250815f90816100839190610190565b5060016100908282610190565b5050506001600160a01b0381166100ba57604051634ddb0f3160e11b815260040160405180910390fd5b6001600160a01b031660805261024a565b5f602082840312156100db575f5ffd5b81516001600160a01b03811681146100f1575f5ffd5b9392505050565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061012057607f821691505b60208210810361013e57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561018b57805f5260205f20601f840160051c810160208510156101695750805b601f840160051c820191505b81811015610188575f8155600101610175565b50505b505050565b81516001600160401b038111156101a9576101a96100f8565b6101bd816101b7845461010c565b84610144565b6020601f8211600181146101ef575f83156101d85750848201515b5f19600385901b1c1916600184901b178455610188565b5f84815260208120601f198516915b8281101561021e57878501518255602094850194600190920191016101fe565b508482101561023b57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b608051611e5a6102705f395f8181610357015281816104c4015261077d0152611e5a5ff3fe608060405234801561000f575f5ffd5b5060043610610153575f3560e01c806370a08231116100bf578063b88d4fde11610079578063b88d4fde146102fc578063bff1f9e11461030f578063c483da2214610317578063c87b56dd1461033f578063e84f43b714610352578063e985e9c514610379575f5ffd5b806370a082311461028e57806374f0314f146102a1578063828e1ffd146102ab57806395d89b41146102d3578063a04241d3146102db578063a22cb465146102ee575f5ffd5b806342842e0e1161011057806342842e0e146101ef5780634fc1854a14610202578063591ff3e0146102385780635b9b1dce1461024b5780635c9302c9146102735780636352211e1461027b575f5ffd5b806301ffc9a71461015757806306fdde031461017f578063081812fc14610194578063095ea7b3146101bf578063183ff085146101d457806323b872dd146101dc575b5f5ffd5b61016a610165366004611321565b61038c565b60405190151581526020015b60405180910390f35b6101876103dd565b604051610176919061136a565b6101a76101a236600461137c565b61046c565b6040516001600160a01b039091168152602001610176565b6101d26101cd3660046113ae565b610493565b005b6101d26104ac565b6101d26101ea3660046113d6565b6106ac565b6101d26101fd3660046113d6565b61073a565b61022a610210366004611410565b6001600160a01b03165f9081526006602052604090205490565b604051908152602001610176565b61016a610246366004611410565b610759565b61022a610259366004611410565b6001600160a01b03165f9081526009602052604090205490565b61022a61081d565b6101a761028936600461137c565b610830565b61022a61029c366004611410565b61083a565b61022a6201518081565b61022a6102b9366004611410565b6001600160a01b03165f9081526008602052604090205490565b61018761087f565b61022a6102e9366004611410565b61088e565b6101d26101cd366004611429565b6101d261030a366004611476565b6108ed565b600b5461022a565b61022a610325366004611410565b6001600160a01b03165f9081526007602052604090205490565b61018761034d36600461137c565b610905565b6101a77f000000000000000000000000000000000000000000000000000000000000000081565b61016a610387366004611553565b6109a3565b5f6001600160e01b031982166380ac58cd60e01b14806103bc57506001600160e01b03198216635b5e139f60e01b145b806103d757506301ffc9a760e01b6001600160e01b03198316145b92915050565b60605f80546103eb90611584565b80601f016020809104026020016040519081016040528092919081815260200182805461041790611584565b80156104625780601f1061043957610100808354040283529160200191610462565b820191905f5260205f20905b81548152906001019060200180831161044557829003601f168201915b5050505050905090565b5f610476826109d0565b505f828152600460205260409020546001600160a01b03166103d7565b60405163a4420a9560e01b815260040160405180910390fd5b6040516370a0823160e01b81523360048201526001907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610511573d5f5f3e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061053591906115bc565b1015610554576040516327b4d8cf60e21b815260040160405180910390fd5b5f61055d61081d565b335f9081526007602052604090205490915081811061058f5760405163d3d38ea760e01b815260040160405180910390fd5b5f8261059c8360016115e7565b10156105a95760016105c3565b335f908152600660205260409020546105c39060016115e7565b335f908152600660209081526040808320849055600782528083208790556008909152812054919250906105f89060016115e7565b335f90815260086020908152604080832084905560099091528120549192500361066357600a80545f918261062c836115fa565b90915550335f908152600960205260408120829055600b805492935090610652836115fa565b91905055506106613382610a08565b505b604080518581526020810184905290810182905233907ff70c8ccfb49937cb9079ffa719be60366bdb8f901313f28dd3da4e482977a7fa9060600160405180910390a250505050565b6001600160a01b0382166106da57604051633250574960e11b81525f60048201526024015b60405180910390fd5b5f6106e6838333610a69565b9050836001600160a01b0316816001600160a01b031614610734576040516364283d7b60e01b81526001600160a01b03808616600483015260248201849052821660448201526064016106d1565b50505050565b61075483838360405180602001604052805f8152506108ed565b505050565b6040516370a0823160e01b81526001600160a01b0382811660048301525f916001917f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa1580156107c2573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906107e691906115bc565b10156107f357505f919050565b6107fb61081d565b6001600160a01b039092165f9081526007602052604090205491909110919050565b5f61082b6201518042611612565b905090565b5f6103d7826109d0565b5f6001600160a01b038216610864576040516322718ad960e21b81525f60048201526024016106d1565b506001600160a01b03165f9081526003602052604090205490565b6060600180546103eb90611584565b5f5f61089861081d565b6001600160a01b0384165f908152600760205260409020549091508111156108c257505f92915050565b42620151806108d28360016115e7565b6108dc9190611631565b6108e69190611648565b9392505050565b6108f88484846106ac565b6107343385858585610ac9565b5f818152600260205260409020546060906001600160a01b03168061094057604051637e27328960e01b8152600481018490526024016106d1565b6001600160a01b0381165f9081526006602090815260408083205460089092528220546109789161097391879190610bf1565b610c99565b90508060405160200161098b9190611672565b60405160208183030381529060405292505050919050565b6001600160a01b039182165f90815260056020908152604080832093909416825291909152205460ff1690565b5f818152600260205260408120546001600160a01b0316806103d757604051637e27328960e01b8152600481018490526024016106d1565b6001600160a01b038216610a3157604051633250574960e11b81525f60048201526024016106d1565b5f610a3d83835f610a69565b90506001600160a01b03811615610754576040516339e3563760e11b81525f60048201526024016106d1565b5f828152600260205260408120546001600160a01b03168015801590610a9757506001600160a01b03851615155b15610ab55760405163a4420a9560e01b815260040160405180910390fd5b610ac0858585610cbf565b95945050505050565b6001600160a01b0383163b15610bea57604051630a85bd0160e11b81526001600160a01b0384169063150b7a0290610b0b9088908890879087906004016116a3565b6020604051808303815f875af1925050508015610b45575060408051601f3d908101601f19168201909252610b42918101906116df565b60015b610bac573d808015610b72576040519150601f19603f3d011682016040523d82523d5f602084013e610b77565b606091505b5080515f03610ba457604051633250574960e11b81526001600160a01b03851660048201526024016106d1565b805160208201fd5b6001600160e01b03198116630a85bd0160e11b14610be857604051633250574960e11b81526001600160a01b03851660048201526024016106d1565b505b5050505050565b60605f610bfd85610db1565b610c0b610973878787610e41565b604051602001610c1c9291906116fa565b60405160208183030381529060405290505f610c3785610db1565b610c4085610db1565b610c4988610db1565b604051602001610c5b93929190611805565b60405160208183030381529060405290508181604051602001610c7f9291906118eb565b604051602081830303815290604052925050509392505050565b60606103d782604051806060016040528060408152602001611de5604091396001610eeb565b5f828152600260205260408120546001600160a01b0390811690831615610ceb57610ceb818486611066565b6001600160a01b03811615610d2557610d065f855f5f6110ca565b6001600160a01b0381165f90815260036020526040902080545f190190555b6001600160a01b03851615610d53576001600160a01b0385165f908152600360205260409020805460010190555b5f8481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b60605f610dbd836111ce565b60010190505f8167ffffffffffffffff811115610ddc57610ddc611462565b6040519080825280601f01601f191660200182016040528015610e06576020820181803683370190505b5090508181016020015b5f19016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610e1057509392505050565b60605f610e4d85610db1565b604051602001610e5d91906118ff565b60405160208183030381529060405290505f610e7885610db1565b610e8185610db1565b604051602001610e92929190611b71565b60408051601f1981840301815260c0830190915260888083529092505f9190611d5d60208301399050828282604051602001610ed093929190611d45565b60405160208183030381529060405293505050509392505050565b606083515f03610f09575060408051602081019091525f81526108e6565b5f82610f3957600385516004610f1f9190611631565b610f2a9060026115e7565b610f349190611612565b610f5e565b600385516002610f4991906115e7565b610f539190611612565b610f5e906004611631565b90505f8167ffffffffffffffff811115610f7a57610f7a611462565b6040519080825280601f01601f191660200182016040528015610fa4576020820181803683370190505b509050600185016020820187885189016020810180515f82525b82841015611019576003840193508351603f8160121c168701518653600186019550603f81600c1c168701518653600186019550603f8160061c168701518653600186019550603f8116870151865350600185019450610fbe565b90525050851561105a5760038851066001811461103d576002811461105057611058565b603d6001830353603d6002830353611058565b603d60018303535b505b50909695505050505050565b6110718383836112a5565b610754576001600160a01b03831661109f57604051637e27328960e01b8152600481018290526024016106d1565b60405163177e802f60e01b81526001600160a01b0383166004820152602481018290526044016106d1565b80806110de57506001600160a01b03821615155b1561119f575f6110ed846109d0565b90506001600160a01b038316158015906111195750826001600160a01b0316816001600160a01b031614155b801561112c575061112a81846109a3565b155b156111555760405163a9fbf51f60e01b81526001600160a01b03841660048201526024016106d1565b811561119d5783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50505f90815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b5f8072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b831061120c5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310611238576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061125657662386f26fc10000830492506010015b6305f5e100831061126e576305f5e100830492506008015b612710831061128257612710830492506004015b60648310611294576064830492506002015b600a83106103d75760010192915050565b5f6001600160a01b038316158015906113015750826001600160a01b0316846001600160a01b031614806112de57506112de84846109a3565b8061130157505f828152600460205260409020546001600160a01b038481169116145b949350505050565b6001600160e01b03198116811461131e575f5ffd5b50565b5f60208284031215611331575f5ffd5b81356108e681611309565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f6108e6602083018461133c565b5f6020828403121561138c575f5ffd5b5035919050565b80356001600160a01b03811681146113a9575f5ffd5b919050565b5f5f604083850312156113bf575f5ffd5b6113c883611393565b946020939093013593505050565b5f5f5f606084860312156113e8575f5ffd5b6113f184611393565b92506113ff60208501611393565b929592945050506040919091013590565b5f60208284031215611420575f5ffd5b6108e682611393565b5f5f6040838503121561143a575f5ffd5b61144383611393565b915060208301358015158114611457575f5ffd5b809150509250929050565b634e487b7160e01b5f52604160045260245ffd5b5f5f5f5f60808587031215611489575f5ffd5b61149285611393565b93506114a060208601611393565b925060408501359150606085013567ffffffffffffffff8111156114c2575f5ffd5b8501601f810187136114d2575f5ffd5b803567ffffffffffffffff8111156114ec576114ec611462565b604051601f8201601f19908116603f0116810167ffffffffffffffff8111828210171561151b5761151b611462565b604052818152828201602001891015611532575f5ffd5b816020840160208301375f6020838301015280935050505092959194509250565b5f5f60408385031215611564575f5ffd5b61156d83611393565b915061157b60208401611393565b90509250929050565b600181811c9082168061159857607f821691505b6020821081036115b657634e487b7160e01b5f52602260045260245ffd5b50919050565b5f602082840312156115cc575f5ffd5b5051919050565b634e487b7160e01b5f52601160045260245ffd5b808201808211156103d7576103d76115d3565b5f6001820161160b5761160b6115d3565b5060010190565b5f8261162c57634e487b7160e01b5f52601260045260245ffd5b500490565b80820281158282048414176103d7576103d76115d3565b818103818111156103d7576103d76115d3565b5f81518060208401855e5f93019283525090919050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c00000081525f6108e6601d83018461165b565b6001600160a01b03858116825284166020820152604081018390526080606082018190525f906116d59083018461133c565b9695505050505050565b5f602082840312156116ef575f5ffd5b81516108e681611309565b7f7b226e616d65223a224167656e7453747265616b20426164676520230000000081525f61172b601c83018561165b565b61088b60f21b81527f226465736372697074696f6e223a22536f756c626f756e64206461696c79206360028201527f6865636b2d696e20626164676520666f72204167656e7420494420686f6c646560228201527f7273206f6e20424e4220436861696e2e204e6f6e2d7472616e7366657261626c604282015263194b888b60e21b60628201527f22696d616765223a22646174613a696d6167652f7376672b786d6c3b626173656066820152620d8d0b60ea1b60868201526117f1608982018561165b565b61088b60f21b815260020195945050505050565b7f2261747472696275746573223a5b7b2274726169745f74797065223a2253747281526c32b0b59116113b30b63ab2911d60991b60208201525f61184c602d83018661165b565b611f4b60f21b81527f7b2274726169745f74797065223a22546f74616c20436865636b2d496e73222c600282015267113b30b63ab2911d60c11b6022820152611898602a82018661165b565b9050611f4b60f21b81527f7b2274726169745f74797065223a224261646765222c2276616c7565223a000060028201526118d5602082018561165b565b627d5d7d60e81b81526003019695505050505050565b5f6113016118f9838661165b565b8461165b565b7f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323081527f30302f737667222077696474683d2234303022206865696768743d223430302260208201527f2076696577426f783d223020302034303020343030223e00000000000000000060408201527f3c726563742077696474683d2234303022206865696768743d2234303022206660578201526e34b6361e91119821182118a291179f60891b60778201527f3c7265637420783d2231322220793d223132222077696474683d22333736222060868201527f6865696768743d22333736222072783d223234222066696c6c3d226e6f6e652260a68201527f207374726f6b653d222346304239304222207374726f6b652d77696474683d2260c6820152631991179f60e11b60e68201527f3c7465787420783d223230302220793d2237302220666f6e742d66616d696c7960ea8201527f3d226d6f6e6f73706163652220666f6e742d73697a653d223236222066696c6c61010a8201527f3d22234630423930422220746578742d616e63686f723d226d6964646c65223e61012a8201527120a3a2a72a29aa2922a0a59e17ba32bc3a1f60711b61014a8201527f3c7465787420783d223230302220793d223131302220666f6e742d66616d696c61015c8201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223135222066696c61017c8201527f6c3d22234141414141412220746578742d616e63686f723d226d6964646c652261019c820152713e534f554c424f554e44204241444745202360701b6101bc8201525f611b5a6101ce83016118f9565b661e17ba32bc3a1f60c91b81526007019392505050565b7f3c7465787420783d223230302220793d223231302220666f6e742d66616d696c81527f793d226d6f6e6f73706163652220666f6e742d73697a653d223732222066696c60208201527f6c3d22234646464646462220746578742d616e63686f723d226d6964646c65226040820152601f60f91b60608201525f611bf8606183018561165b565b661e17ba32bc3a1f60c91b81527f3c7465787420783d223230302220793d223234352220666f6e742d66616d696c60078201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223138222066696c60278201527f6c3d22234141414141412220746578742d616e63686f723d226d6964646c65226047820152711f2220ac9029aa2922a0a59e17ba32bc3a1f60711b60678201527f3c7465787420783d223230302220793d223330302220666f6e742d66616d696c60798201527f793d226d6f6e6f73706163652220666f6e742d73697a653d223138222066696c60998201527f6c3d22234646464646462220746578742d616e63686f723d226d6964646c652260b98201527101f2a37ba30b61031b432b1b596b4b7399d160751b60d9820152611d2c60eb82018561165b565b661e17ba32bc3a1f60c91b815260070195945050505050565b5f610ac06118f9611d56848861165b565b8661165b56fe3c7465787420783d223230302220793d223335302220666f6e742d66616d696c793d226d6f6e6f73706163652220666f6e742d73697a653d223133222066696c6c3d22233636363636362220746578742d616e63686f723d226d6964646c65223e424e4220436861696e202d204167656e742049442067617465643c2f746578743e3c2f7376673e4142434445464748494a4b4c4d4e4f505152535455565758595a6162636465666768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2fa26469706673582212203feec04cb0a13e717c9ca75d834ea943078d2a754a5a0b69855efb4fba39b4d764736f6c634300081e003300000000000000000000000060b9262456de011f7d15a54cdd8c48baaa8b022f
```

## 5. Langkah deploy manual

> **Catatan baw:** `baw contract-call preview` WAJIB memakai `--to`
> (alamat kontrak yang sudah ada) — perintah itu untuk *call*, bukan untuk
> *deploy*. Jadi deploy TIDAK bisa lewat `baw contract-call`. Deploy harus
> lewat wallet/tool yang mendukung contract creation (mis. Binance Wallet
> app, atau Remix + Agentic Wallet, atau tool deploy pilihan koordinator),
> dengan mengirim transaksi creation (`to` kosong) berisi init code §4.

1. **Siapkan wallet deploy** (Agentic Wallet pemilik proyek,
   `0x634f2cB9bbE400859d6372094eD656Ae65D5e2f6`).
   Pastikan saldo ≥ **0,001 BNB** (biaya deploy ~0,0001 BNB + buffer).
   Deploy TIDAK butuh approval / allowance apa pun.
2. **Kirim transaksi creation** di BNB Chain (chain 56):
   - `to`: *(kosong — contract creation)*
   - `value`: `0`
   - `data`: init code lengkap §4 (atau file `artifacts/AgentStreak.initcode.txt`)
   - `gasLimit`: `2000000`
   - `gasPrice`: harga live saat itu (cek `cast gas-price --rpc-url https://bsc-dataseed.binance.org`;
     saat dokumen ini ditulis: 0,05 gwei).
3. **Tunggu receipt** (`status == 1`), catat **alamat kontrak** hasil deploy.
4. **Sanity check on-chain** (read-only, tanpa gas):
   ```shell
   export PATH="$HOME/.foundry/bin:$PATH"
   RPC=https://bsc-dataseed.binance.org
   ADDR=<alamat-kontrak-hasil-deploy>
   cast call --rpc-url $RPC $ADDR "agentId()(address)"
   # harus: 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
   cast call --rpc-url $RPC $ADDR "name()(string)"     # "AgentStreak"
   cast call --rpc-url $RPC $ADDR "symbol()(string)"   # "ASTRK"
   cast call --rpc-url $RPC $ADDR "totalUsers()(uint256)"  # 0
   ```
5. **Uji checkIn pertama** (opsional, dari wallet pemegang Agent ID):
   `checkIn()` harus sukses 1x lalu `streakOf` = 1, `badgeOf` = 1,
   `ownerOf(1)` = caller. Check-in kedua di hari yang sama harus revert
   `AlreadyCheckedInToday`.

## 6. Verifikasi source di BscScan

1. Buka halaman kontrak di BscScan → tab **Contract** → **Verify and Publish**.
2. Compiler Type: **Solidity (Single file)**.
3. Compiler Version: **v0.8.30+commit.73712a01** (exact — sama seperti `pragma`).
4. Open Source License Type: **MIT**.
5. Optimization: **Yes, runs 200**.
6. EVM Version: **cancun** (bila BscScan menanyakan; default bila tidak ada).
7. Paste source: **`flattened/AgentStreak.flattened.sol`** (3.784 baris,
   flatten dari `src/AgentStreak.sol` + OpenZeppelin v5.4.0).
   File ini sudah dibuktikan: dikompilasi mandiri dengan solc 0.8.30
   (optimizer 200, cancun) menghasilkan creation code yang **identik
   byte-per-byte** dengan build proyek (di luar metadata hash, yang wajar
   berbeda karena path source — BscScan menanganinya).
8. Constructor Arguments: **ABI-encoded hex §2** (tanpa `0x`):
   ```text
   00000000000000000000000060b9262456de011f7d15a54cdd8c48baaa8b022f
   ```
9. Bila verifikasi sukses, BscScan menampilkan centang hijau + tab
   **Read/Write Contract**. Cocokkan `agentId()` dengan §2.

## 7. Validasi yang sudah dilakukan (lokal, tanpa tx mainnet)

- `forge build` bersih (1 warning linter yang disengaja — `_mint`, lihat README).
- `forge test`: **27/27 PASS**.
- Slither 0.11.6: **0 High / 0 Medium di `AgentStreak.sol`**
  (laporan: `slither-report.txt` / `slither-report.json`).
- Flattened source dikompilasi mandiri → creation code identik.
- Init code persis dari `artifacts/AgentStreak.initcode.txt` di-deploy ke
  **anvil lokal** (MockAgentID sebagai constructor arg): `agentId()`,
  `checkIn()` (gas 192.306), `streakOf`/`badgeOf`/`ownerOf`/`tokenURI`,
  revert `Soulbound` (transfer/approve) dan `AlreadyCheckedInToday`
  semuanya terverifikasi terhadap kontrak hasil deploy bytecode final.
- `tokenURI(1)` di-decode: JSON valid + SVG valid XML.

## 8. Setelah deploy — yang harus dicatat

- [x] Alamat kontrak AgentStreak: `0xcd3583aC76fF66f2306fD7b66bB2283F9aE32227`
- [x] Tx hash deploy: `0xad12a9068dd6b185ae65dd2d0e0f77afa61d2c802ef86ad099389f66993b6e64`
- [x] Blok deploy: `134454695`
- [x] Biaya deploy aktual (BNB): `0,00031819847003405` (gasUsed 1.813.114 × 0,175498325 gwei)
- [x] Sourcify verified: YA — full match (creation + runtime), 19 Nov 2026 13:45 WIB, matchId 59510592, https://sourcify.dev/server/v2/contract/56/0xcd3583aC76fF66f2306fD7b66bB2283F9aE32227
- [ ] BscScan verified: belum — mirror Sourcify→BscScan gagal (limit harian 500 submission Etherscan); verifikasi manual via situs BscScan dari HP masih bisa dilakukan (compiler v0.8.30+commit.73712a01, MIT, optimizer 200, EVM cancun, flattened source §6)
- [x] `agentId()` on-chain cocok dengan §2: ya (`0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`, name "AgentStreak", symbol "ASTRK", totalUsers 0)

> **DEPLOYED 19 Nov 2026 ~13:23 WIB** — via CREATE2 factory 0x4e59b44847b379578588920cA78FbF26c0B4956C (0age deterministic deployment proxy) karena `baw` tidak bisa kirim creation tx dan WalletConnect/Remix tidak pernah tersambung. Calldata = salt 32 byte nol + init code §4 (8.458 byte). Preview baw bersih (requestId f0a1634c633b46a28f6337a7258e53ae, no approval/authority change/risk). Sim `cast call` + `cast create2` cocok persis dengan alamat hasil. Order baw 26111900002065702053, status BROADCASTED → receipt status 1. Runtime code 7.770 byte, cocok dengan §4.
