const p2tr = {
  valid: [
    {
      description: 'output and pubkey from address',
      arguments: {
        address:
          'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6sj7lcqx',
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description: 'address and pubkey from output',
      arguments: {
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6sj7lcqx',
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description: 'address and output from pubkey',
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6sj7lcqx',
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description: 'address, output and witness from pubkey and signature',
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        signature:
          'a251221c339a7129dd0b769698aca40d8d9da9570ab796a1820b91ab7dbf5acbea21c88ba8f1e9308a21729baf080734beaf97023882d972f75e380d480fd704',
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6sj7lcqx',
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        input: null,
        witness: [
          'a251221c339a7129dd0b769698aca40d8d9da9570ab796a1820b91ab7dbf5acbea21c88ba8f1e9308a21729baf080734beaf97023882d972f75e380d480fd704',
        ],
      },
    },
    {
      description: 'address, output and signature from pubkey and witness',
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        witness: ['300602010002010001'],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6sj7lcqx',
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        input: null,
        signature: '300602010002010001',
        witness: ['300602010002010001'],
      },
    },
    {
      description: 'address, pubkey and output from internalPubkey',
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1prs7pxymu7jhsptzjlwlqnk8jyg5qmq4sdlc3rwcy7pd3ydz92xjq5ap2sg',
        pubkey:
          '1c3c13137cf4af00ac52fbbe09d8f222280d82b06ff111bb04f05b12344551a4',
        output:
          'OP_1 1c3c13137cf4af00ac52fbbe09d8f222280d82b06ff111bb04f05b12344551a4',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, internalPubkey, redeeem and output from witness',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
      expected: {
        name: 'p2tr',
        internalPubkey:
          'a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a36',
        pubkey:
          '1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc',
        hash: 'c5c62d7fc595ba5fbe61602eb1a29e2e4763408fe1e2b161beb7cb3c71ebcad9',
        address:
          'bc1pr6lghypk80gf025lx5kgkgv3fcvgd0qfl608psylx0hj624a7j7qay80rv',
        output:
          'OP_1 1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc',
        signature: null,
        input: null,
        redeem: {
          output:
            'OP_DROP c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0 OP_CHECKSIG',
          redeemVersion: 192,
          witness: [
            '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
            '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          ],
        },
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description:
        'address, pubkey, internalPubkey and output from witness with annex',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
          '5000000000000000001111111111111111',
        ],
      },
      expected: {
        name: 'p2tr',
        internalPubkey:
          'a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a36',
        pubkey:
          '1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc',
        hash: 'c5c62d7fc595ba5fbe61602eb1a29e2e4763408fe1e2b161beb7cb3c71ebcad9',
        address:
          'bc1pr6lghypk80gf025lx5kgkgv3fcvgd0qfl608psylx0hj624a7j7qay80rv',
        output:
          'OP_1 1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc',
        signature: null,
        input: null,
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
          '5000000000000000001111111111111111',
        ],
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with one leaf',
      arguments: {
        internalPubkey:
          '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
        scriptTree: {
          output:
            '83d8ee77a0f3a32a5cea96fd1624d623b836c1e5d1ac2dcde46814b619320c18 OP_CHECKSIG',
        },
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pjegs09vkeder9m4sw3ycjf2rnpa8nljdqmuleunk9eshu8cq3xysvhgp2u',
        pubkey:
          '9651079596cb7232eeb07449892543987a79fe4d06f9fcf2762e617e1f008989',
        output:
          'OP_1 9651079596cb7232eeb07449892543987a79fe4d06f9fcf2762e617e1f008989',
        hash: '16e3f3b8b9c1e453c56b547785cdd25259d65823a2064f30783acc58ef012633',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with two leafs',
      arguments: {
        internalPubkey:
          '2258b1c3160be0864a541854eec9164a572f094f7562628281a8073bb89173a7',
        scriptTree: [
          {
            output:
              'd826a0a53abb6ffc60df25b9c152870578faef4b2eb5a09bdd672bbe32cdd79b OP_CHECKSIG',
          },
          {
            output:
              'd826a0a53abb6ffc60df25b9c152870578faef4b2eb5a09bdd672bbe32cdd79b OP_CHECKSIG',
          },
        ],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1ptj0v8rwcj6s36p4r26ws6htx0fct43n0mxdvdeh9043whlxlq3kq9965ke',
        pubkey:
          '5c9ec38dd896a11d06a3569d0d5d667a70bac66fd99ac6e6e57d62ebfcdf046c',
        output:
          'OP_1 5c9ec38dd896a11d06a3569d0d5d667a70bac66fd99ac6e6e57d62ebfcdf046c',
        hash: 'ce00198cd4667abae1f94aa5862d089e2967af5aec20715c692db74e3d66bb73',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with three leafs',
      arguments: {
        internalPubkey:
          '7631cacec3343052d87ef4d0065f61dde82d7d2db0c1cc02ef61ef3c982ea763',
        scriptTree: [
          {
            output:
              '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
          },
          [
            {
              output:
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            },
            {
              output:
                '9b4d495b74887815a1ff623c055c6eac6b6b2e07d2a016d6526ebac71dd99744 OP_CHECKSIG',
            },
          ],
        ],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pkq0t8nkmqswn3qjg9uy6ux2hsyyz4as25v8unfjc9s8q2e4c00sqku9lxh',
        pubkey:
          'b01eb3cedb041d3882482f09ae195781082af60aa30fc9a6582c0e0566b87be0',
        output:
          'OP_1 b01eb3cedb041d3882482f09ae195781082af60aa30fc9a6582c0e0566b87be0',
        hash: '7ae0cc2057b1a7bf0e09c787e1d7b6b2355ac112a7b80380a5c1e942155b0c0f',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with four leafs',
      arguments: {
        internalPubkey:
          'd0c19def28bb1b39451c1a814737615983967780d223b79969ba692182c6006b',
        scriptTree: [
          [
            {
              output:
                '9b4d495b74887815a1ff623c055c6eac6b6b2e07d2a016d6526ebac71dd99744 OP_CHECKSIG',
            },
            {
              output:
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            },
          ],
          [
            {
              output:
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            },
            {
              output:
                '9b4d495b74887815a1ff623c055c6eac6b6b2e07d2a016d6526ebac71dd99744 OP_CHECKSIG',
            },
          ],
        ],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pstdzevc40j059s0473rghhv9e05l9f5xv7l6dtlavvq22rzfna3syjvjut',
        pubkey:
          '82da2cb3157c9f42c1f5f4468bdd85cbe9f2a68667bfa6affd6300a50c499f63',
        output:
          'OP_1 82da2cb3157c9f42c1f5f4468bdd85cbe9f2a68667bfa6affd6300a50c499f63',
        hash: 'd673e784eac9b70289130a0bd359023a0fbdde51dc069b9efb4157c2cdce3ea5',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with seven leafs',
      arguments: {
        internalPubkey:
          'f95886b02a84928c5c15bdca32784993105f73de27fa6ad8c1a60389b999267c',
        scriptTree: [
          [
            {
              output:
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            },
            [
              {
                output:
                  '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
              },
              {
                output:
                  '2258b1c3160be0864a541854eec9164a572f094f7562628281a8073bb89173a7 OP_CHECKSIG',
              },
            ],
          ],
          [
            {
              output:
                '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
            },
            [
              {
                output:
                  '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
              },
              [
                {
                  output:
                    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0 OP_CHECKSIG',
                },
                {
                  output:
                    '03a669ea926f381582ec4a000b9472ba8a17347f5fb159eddd4a07036a6718eb OP_CHECKSIG',
                },
              ],
            ],
          ],
        ],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pfas4r5s5208puwzj20hvwg2dw2kanc06yxczzdd66729z63pk43q7zwlu6',
        pubkey:
          '4f6151d21453ce1e385253eec7214d72add9e1fa21b02135bad794516a21b562',
        output:
          'OP_1 4f6151d21453ce1e385253eec7214d72add9e1fa21b02135bad794516a21b562',
        hash: '16fb2e99bdf86f67ee6980d0418658f15df7e19476053b58f45a89df2e219b1b',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description:
        'address, pubkey, and output from internalPubkey redeem, and hash (one leaf, no tree)',
      arguments: {
        internalPubkey:
          'aba457d16a8d59151c387f24d1eb887efbe24644c1ee64b261282e7baebdb247',
        redeem: {
          output:
            '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4 OP_CHECKSIG',
        },
        hash: 'b424dea09f840b932a00373cdcdbd25650b8c3acfe54a9f4a641a286721b8d26',
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pnxyp0ahcg53jzgrzj57hnlgdtqtzn7qqhmgjgczk8hzhcltq974qazepzf',
        pubkey:
          '998817f6f84523212062953d79fd0d581629f800bed12460563dc57c7d602faa',
        output:
          'OP_1 998817f6f84523212062953d79fd0d581629f800bed12460563dc57c7d602faa',
        signature: null,
        input: null,
        witness: [
          '2050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4ac',
          'c0aba457d16a8d59151c387f24d1eb887efbe24644c1ee64b261282e7baebdb247',
        ],
      },
    },
    {
      description:
        'address, pubkey, output and hash from internalPubkey and a script tree with seven leafs (2)',
      arguments: {
        internalPubkey:
          'aba457d16a8d59151c387f24d1eb887efbe24644c1ee64b261282e7baebdb247',
        redeem: {
          output:
            '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4 OP_CHECKSIG',
        },
        scriptTree: [
          {
            output:
              '00a9da96087a72258f83b338ef7f0ea8cbbe05da5f18f091eb397d1ecbf7c3d3 OP_CHECKSIG',
          },
          [
            [
              {
                output:
                  '00a9da96087a72258f83b338ef7f0ea8cbbe05da5f18f091eb397d1ecbf7c3d4 OP_CHECKSIG',
              },
              [
                {
                  output:
                    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac1 OP_CHECKSIG',
                },
                {
                  output:
                    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac2 OP_CHECKSIG',
                },
              ],
            ],
            [
              [
                {
                  output:
                    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac3 OP_CHECKSIG',
                },
                {
                  output:
                    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4 OP_CHECKSIG',
                },
              ],
              {
                output:
                  '00a9da96087a72258f83b338ef7f0ea8cbbe05da5f18f091eb397d1ecbf7c3d5 OP_CHECKSIG',
              },
            ],
          ],
        ],
      },
      expected: {
        name: 'p2tr',
        address:
          'bc1pd2llmtym6c5hyecf5zqsyjz9q0jlxaaksw9j0atx8lc8a0e0vrmsw9ewly',
        pubkey:
          '6abffdac9bd629726709a08102484503e5f377b6838b27f5663ff07ebf2f60f7',
        output:
          'OP_1 6abffdac9bd629726709a08102484503e5f377b6838b27f5663ff07ebf2f60f7',
        hash: '88b7e3b495a84aa2bc12780b1773f130ce5eb747b0c28dc4840b7c9280f7326d',
        signature: null,
        input: null,
        witness: [
          '2050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac4ac',
          'c0aba457d16a8d59151c387f24d1eb887efbe24644c1ee64b261282e7baebdb247dac795766bbda1eaeaa45e5bfa0a950fdd5f4c4aada5b1f3082edc9689b9fd0a315fb34a7a93dcaed5e26cf7468be5bd377dda7a4d29128f7dd98db6da9bf04325fff3aa86365bac7534dcb6495867109941ec444dd35294e0706e29e051066d73e0d427bd3249bb921fa78c04fb76511f583ff48c97210d17c2d9dcfbb95023',
        ],
      },
    },
    {
      description: 'BIP341 Test case 1',
      arguments: {
        internalPubkey:
          'd6889cb081036e0faefa3a35157ad71086b123b2b144b649798b494c300a961d',
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 53a1f6e454df1aa2776a2814a721372d6258050de330b3c6d10ee8f4e0dda343',
        pubkey:
          '53a1f6e454df1aa2776a2814a721372d6258050de330b3c6d10ee8f4e0dda343',
        address:
          'bc1p2wsldez5mud2yam29q22wgfh9439spgduvct83k3pm50fcxa5dps59h4z5',
        signature: null,
        input: null,
        witness: null,
      },
    },
    {
      description: 'BIP341 Test case 2',
      arguments: {
        internalPubkey:
          '187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
        redeem: {
          output:
            'd85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: {
          output:
            'd85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8 OP_CHECKSIG',
          version: 192,
        },
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 147c9c57132f6e7ecddba9800bb0c4449251c92a1e60371ee77557b6620f3ea3',
        pubkey:
          '147c9c57132f6e7ecddba9800bb0c4449251c92a1e60371ee77557b6620f3ea3',
        address:
          'bc1pz37fc4cn9ah8anwm4xqqhvxygjf9rjf2resrw8h8w4tmvcs0863sa2e586',
        hash: '5b75adecf53548f3ec6ad7d78383bf84cc57b55a3127c72b9a2481752dd88b21',
        witness: [
          '20d85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8ac',
          'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
        ],
        redeem: {
          output:
            'd85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8 OP_CHECKSIG',
          redeemVersion: 192,
        },
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 3',
      arguments: {
        internalPubkey:
          '93478e9488f956df2396be2ce6c5cced75f900dfa18e7dabd2428aae78451820',
        redeem: {
          output:
            'b617298552a72ade070667e86ca63b8f5789a9fe8731ef91202a91c9f3459007 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: {
          output:
            'b617298552a72ade070667e86ca63b8f5789a9fe8731ef91202a91c9f3459007 OP_CHECKSIG',
          version: 192,
        },
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 e4d810fd50586274face62b8a807eb9719cef49c04177cc6b76a9a4251d5450e',
        pubkey:
          'e4d810fd50586274face62b8a807eb9719cef49c04177cc6b76a9a4251d5450e',
        address:
          'bc1punvppl2stp38f7kwv2u2spltjuvuaayuqsthe34hd2dyy5w4g58qqfuag5',
        hash: 'c525714a7f49c28aedbbba78c005931a81c234b2f6c99a73e4d06082adc8bf2b',
        witness: [
          '20b617298552a72ade070667e86ca63b8f5789a9fe8731ef91202a91c9f3459007ac',
          'c093478e9488f956df2396be2ce6c5cced75f900dfa18e7dabd2428aae78451820',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 4 - spend leaf 0',
      arguments: {
        internalPubkey:
          'ee4fe085983462a184015d1f782d6a5f8b9c2b60130aff050ce221ecf3786592',
        redeem: {
          output:
            '387671353e273264c495656e27e39ba899ea8fee3bb69fb2a680e22093447d48 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '387671353e273264c495656e27e39ba899ea8fee3bb69fb2a680e22093447d48 OP_CHECKSIG',
            version: 192,
          },
          {
            output: '424950333431',
            version: 152,
          },
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 0f63ca2c7639b9bb4be0465cc0aa3ee78a0761ba5f5f7d6ff8eab340f09da561',
        pubkey:
          '0f63ca2c7639b9bb4be0465cc0aa3ee78a0761ba5f5f7d6ff8eab340f09da561',
        address:
          'bc1ppa3u5trk8xumkjlqgewvp237u79qwcd6ta0h6mlca2e5puya54ssw9zq0y',
        hash: 'f3004d6c183e038105d436db1424f321613366cbb7b05939bf05d763a9ebb962',
        witness: [
          '20387671353e273264c495656e27e39ba899ea8fee3bb69fb2a680e22093447d48ac',
          'c0ee4fe085983462a184015d1f782d6a5f8b9c2b60130aff050ce221ecf37865927b2c2af8aa3e8b7bfe2f62a155f91427489c5c3b32be47e0b3fac755fc780e0e',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 4 - spend leaf 1',
      arguments: {
        internalPubkey:
          'ee4fe085983462a184015d1f782d6a5f8b9c2b60130aff050ce221ecf3786592',
        redeem: {
          output: '424950333431',
          redeemVersion: 152,
        },
        scriptTree: [
          {
            output:
              '387671353e273264c495656e27e39ba899ea8fee3bb69fb2a680e22093447d48 OP_CHECKSIG',
            version: 192,
          },
          {
            output: '424950333431',
            version: 152,
          },
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 0f63ca2c7639b9bb4be0465cc0aa3ee78a0761ba5f5f7d6ff8eab340f09da561',
        pubkey:
          '0f63ca2c7639b9bb4be0465cc0aa3ee78a0761ba5f5f7d6ff8eab340f09da561',
        address:
          'bc1ppa3u5trk8xumkjlqgewvp237u79qwcd6ta0h6mlca2e5puya54ssw9zq0y',
        hash: 'f3004d6c183e038105d436db1424f321613366cbb7b05939bf05d763a9ebb962',
        witness: [
          '06424950333431',
          '98ee4fe085983462a184015d1f782d6a5f8b9c2b60130aff050ce221ecf37865928ad69ec7cf41c2a4001fd1f738bf1e505ce2277acdcaa63fe4765192497f47a7',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 5 - spend leaf 0',
      arguments: {
        internalPubkey:
          'f9f400803e683727b14f463836e1e78e1c64417638aa066919291a225f0e8dd8',
        redeem: {
          output:
            '44b178d64c32c4a05cc4f4d1407268f764c940d20ce97abfd44db5c3592b72fd OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '44b178d64c32c4a05cc4f4d1407268f764c940d20ce97abfd44db5c3592b72fd OP_CHECKSIG',
            version: 192,
          },
          {
            output: '546170726f6f74',
            version: 82,
          },
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 053690babeabbb7850c32eead0acf8df990ced79f7a31e358fabf2658b4bc587',
        pubkey:
          '053690babeabbb7850c32eead0acf8df990ced79f7a31e358fabf2658b4bc587',
        address:
          'bc1pq5mfpw474wahs5xr9m4dpt8cm7vsemte7733udv040extz6tckrs29g04c',
        hash: 'd9c2c32808b41c0301d876d49c0af72e1d98e84b99ca9b4bb67fea1a7424b755',
        witness: [
          '2044b178d64c32c4a05cc4f4d1407268f764c940d20ce97abfd44db5c3592b72fdac',
          'c1f9f400803e683727b14f463836e1e78e1c64417638aa066919291a225f0e8dd8e44d5f8fa5892c8b6d4d09a08d36edd0b08636e30311302e2448ad8172fb3433',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 5 - spend leaf 1',
      arguments: {
        internalPubkey:
          'f9f400803e683727b14f463836e1e78e1c64417638aa066919291a225f0e8dd8',
        redeem: {
          output: '546170726f6f74',
          redeemVersion: 82,
        },
        scriptTree: [
          {
            output:
              '44b178d64c32c4a05cc4f4d1407268f764c940d20ce97abfd44db5c3592b72fd OP_CHECKSIG',
            version: 192,
          },
          {
            output: '546170726f6f74',
            version: 82,
          },
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 053690babeabbb7850c32eead0acf8df990ced79f7a31e358fabf2658b4bc587',
        pubkey:
          '053690babeabbb7850c32eead0acf8df990ced79f7a31e358fabf2658b4bc587',
        address:
          'bc1pq5mfpw474wahs5xr9m4dpt8cm7vsemte7733udv040extz6tckrs29g04c',
        hash: 'd9c2c32808b41c0301d876d49c0af72e1d98e84b99ca9b4bb67fea1a7424b755',
        witness: [
          '07546170726f6f74',
          '53f9f400803e683727b14f463836e1e78e1c64417638aa066919291a225f0e8dd864512fecdb5afa04f98839b50e6f0cb7b1e539bf6f205f67934083cdcc3c8d89',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 6 - spend leaf 0',
      arguments: {
        internalPubkey:
          'e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f',
        redeem: {
          output:
            '72ea6adcf1d371dea8fba1035a09f3d24ed5a059799bae114084130ee5898e69 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '72ea6adcf1d371dea8fba1035a09f3d24ed5a059799bae114084130ee5898e69 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                '2352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                '7337c0dd4253cb86f2c43a2351aadd82cccb12a172cd120452b9bb8324f2186a OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        pubkey:
          '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        address:
          'bc1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczs6n332e',
        hash: 'ccbd66c6f7e8fdab47b3a486f59d28262be857f30d4773f2d5ea47f7761ce0e2',
        witness: [
          '2072ea6adcf1d371dea8fba1035a09f3d24ed5a059799bae114084130ee5898e69ac',
          'c0e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6fffe578e9ea769027e4f5a3de40732f75a88a6353a09d767ddeb66accef85e553',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 6 - spend leaf 1',
      arguments: {
        internalPubkey:
          'e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f',
        redeem: {
          output:
            '2352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '72ea6adcf1d371dea8fba1035a09f3d24ed5a059799bae114084130ee5898e69 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                '2352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                '7337c0dd4253cb86f2c43a2351aadd82cccb12a172cd120452b9bb8324f2186a OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        pubkey:
          '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        address:
          'bc1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczs6n332e',
        hash: 'ccbd66c6f7e8fdab47b3a486f59d28262be857f30d4773f2d5ea47f7761ce0e2',
        witness: [
          '202352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8ac',
          'c0e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f9e31407bffa15fefbf5090b149d53959ecdf3f62b1246780238c24501d5ceaf62645a02e0aac1fe69d69755733a9b7621b694bb5b5cde2bbfc94066ed62b9817',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 6 - spend leaf 2',
      arguments: {
        internalPubkey:
          'e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f',
        redeem: {
          output:
            '7337c0dd4253cb86f2c43a2351aadd82cccb12a172cd120452b9bb8324f2186a OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '72ea6adcf1d371dea8fba1035a09f3d24ed5a059799bae114084130ee5898e69 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                '2352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                '7337c0dd4253cb86f2c43a2351aadd82cccb12a172cd120452b9bb8324f2186a OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        pubkey:
          '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        address:
          'bc1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczs6n332e',
        hash: 'ccbd66c6f7e8fdab47b3a486f59d28262be857f30d4773f2d5ea47f7761ce0e2',
        witness: [
          '207337c0dd4253cb86f2c43a2351aadd82cccb12a172cd120452b9bb8324f2186aac',
          'c0e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6fba982a91d4fc552163cb1c0da03676102d5b7a014304c01f0c77b2b8e888de1c2645a02e0aac1fe69d69755733a9b7621b694bb5b5cde2bbfc94066ed62b9817',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 7 - spend leaf 0',
      arguments: {
        internalPubkey:
          '55adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312d',
        redeem: {
          output:
            '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
        },
        scriptTree: [
          {
            output:
              '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        pubkey:
          '75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        address:
          'bc1pw5tf7sqp4f50zka7629jrr036znzew70zxyvvej3zrpf8jg8hqcssyuewe',
        hash: '2f6b2c5397b6d68ca18e09a3f05161668ffe93a988582d55c6f07bd5b3329def',
        witness: [
          '2071981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2ac',
          'c155adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312d3cd369a528b326bc9d2133cbd2ac21451acb31681a410434672c8e34fe757e91',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 7 - spend leaf 1',
      arguments: {
        internalPubkey:
          '55adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312d',
        redeem: {
          output:
            'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        pubkey:
          '75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        address:
          'bc1pw5tf7sqp4f50zka7629jrr036znzew70zxyvvej3zrpf8jg8hqcssyuewe',
        hash: '2f6b2c5397b6d68ca18e09a3f05161668ffe93a988582d55c6f07bd5b3329def',
        witness: [
          '20d5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748ac',
          'c155adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312dd7485025fceb78b9ed667db36ed8b8dc7b1f0b307ac167fa516fe4352b9f4ef7f154e8e8e17c31d3462d7132589ed29353c6fafdb884c5a6e04ea938834f0d9d',
        ],
        signature: null,
        input: null,
      },
    },
    {
      description: 'BIP341 Test case 7 - spend leaf 2',
      arguments: {
        internalPubkey:
          '55adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312d',
        redeem: {
          output:
            'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
          redeemVersion: 192,
        },
        scriptTree: [
          {
            output:
              '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
      },
      options: {},
      expected: {
        name: 'p2tr',
        output:
          'OP_1 75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        pubkey:
          '75169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        address:
          'bc1pw5tf7sqp4f50zka7629jrr036znzew70zxyvvej3zrpf8jg8hqcssyuewe',
        hash: '2f6b2c5397b6d68ca18e09a3f05161668ffe93a988582d55c6f07bd5b3329def',
        witness: [
          '20c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4cac',
          'c155adf4e8967fbd2e29f20ac896e60c3b0f1d5b0efa9d34941b5958c7b0a0312d737ed1fe30bc42b8022d717b44f0d93516617af64a64753b7a06bf16b26cd711f154e8e8e17c31d3462d7132589ed29353c6fafdb884c5a6e04ea938834f0d9d',
        ],
        signature: null,
        input: null,
      },
    },
  ],
  invalid: [
    {
      exception: 'Not enough data',
      arguments: {},
    },
    {
      exception: 'Not enough data',
      arguments: {
        signature: '300602010002010001',
      },
    },
    {
      description: 'Incorrect Witness Version',
      exception: 'Output is invalid',
      arguments: {
        output:
          'OP_0 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
      },
    },
    {
      description: 'Invalid x coordinate for pubkey in pubkey',
      exception: 'Invalid pubkey for p2tr',
      arguments: {
        pubkey:
          'f136e956540197c21ff3c075d32a6e3c82f1ee1e646cc0f08f51b0b5edafa762',
      },
    },
    {
      description: 'Invalid x coordinate for pubkey in output',
      exception: 'Invalid pubkey for p2tr',
      arguments: {
        output:
          'OP_1 f136e956540197c21ff3c075d32a6e3c82f1ee1e646cc0f08f51b0b5edafa762',
      },
    },
    {
      description: 'Invalid x coordinate for pubkey in address',
      exception: 'Invalid pubkey for p2tr',
      arguments: {
        address:
          'bc1p7ymwj4j5qxtuy8lncp6ax2nw8jp0rms7v3kvpuy02xcttmd05a3qmwlnez',
      },
    },
    {
      description: 'Pubkey mismatch between pubkey and output',
      exception: 'Pubkey mismatch',
      options: {},
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        output:
          'OP_1 12d7dac98d69a086a50b30959a3537950f356ffc6f50a263ab75c8a3ec9d44c1',
      },
    },
    {
      description: 'Pubkey mismatch between pubkey and address',
      exception: 'Pubkey mismatch',
      options: {},
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        address:
          'bc1pztta4jvddxsgdfgtxz2e5dfhj58n2mludag2ycatwhy28myagnqsnl7mv7',
      },
    },
    {
      description: 'Pubkey mismatch between output and address',
      exception: 'Pubkey mismatch',
      options: {},
      arguments: {
        output:
          'OP_1 ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        address:
          'bc1pztta4jvddxsgdfgtxz2e5dfhj58n2mludag2ycatwhy28myagnqsnl7mv7',
      },
    },
    {
      description: 'Pubkey mismatch between internalPubkey and pubkey',
      exception: 'Pubkey mismatch',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
      },
    },
    {
      description: 'Hash mismatch between scriptTree and hash',
      exception: 'Hash mismatch',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        scriptTree: {
          output:
            '83d8ee77a0f3a32a5cea96fd1624d623b836c1e5d1ac2dcde46814b619320c18 OP_CHECKSIG',
        },
        hash: 'b76077013c8e303085e300000000000000000000000000000000000000000000',
      },
    },
    {
      exception: 'Expected Point',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f8',
      },
    },
    {
      exception: 'Signature mismatch',
      arguments: {
        pubkey:
          'ab610d22c801def8a1e02368d1b92018970eb52a729919705e8a1a2f60c750f5',
        signature:
          'a251221c339a7129dd0b769698aca40d8d9da9570ab796a1820b91ab7dbf5acbea21c88ba8f1e9308a21729baf080734beaf97023882d972f75e380d480fd704',
        witness: [
          '607b8b5b5c8614757736e3d5811790636d2a8e2ea14418f8cff66b2e898b3b7536a49b7c4bc8b3227953194bf5d0548e13e3526fdb36beeefadda1ec834a0db2',
        ],
      },
    },
    {
      exception: 'Invalid prefix or Network mismatch',
      arguments: {
        address:
          'bcrt1prhepe49mpmhclwcqmkzpaz43revunykc7fc0f9az6pq08sn4qe7sxtrd8y',
      },
    },
    {
      exception: 'Invalid address version',
      arguments: {
        address:
          'bc1z4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82r6s6rxhwd',
      },
    },
    {
      exception: 'Invalid address data',
      arguments: {
        address: 'bc1p4dss6gkgq8003g0qyd5drwfqrztsadf2w2v3juz73gdz7cx82qh3d2w3',
      },
    },
    {
      description: 'Control block length too small',
      exception:
        'The control-block length is too small. Got 16, expected min 33.',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8',
        ],
      },
    },
    {
      description:
        'Control block must have a length of 33 + 32m (0 <= m <= 128)',
      exception: 'The control-block length of 40 is incorrect!',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf77',
        ],
      },
    },
    {
      description: 'Control block length too large',
      exception: 'The script path is too long. Got 129, expected max 128.',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c50cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description: 'Invalid internalPubkey in control block',
      exception: 'Invalid internalPubkey for p2tr witness',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c14444444444444444453d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description:
        'internalPubkey mismatch between control block and internalKey',
      exception: 'Internal pubkey mismatch',
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description: 'pubkey mismatch between outputKey and pubkey',
      exception: 'Pubkey mismatch for p2tr witness',
      arguments: {
        pubkey:
          'df0e070ca2fca05ecd191bdba047841d62414b2bdcb6249c258fd64c0dd251ff',
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description: 'parity',
      exception: 'Incorrect parity',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c0a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
      },
    },
    {
      description: 'Script Tree is not a binary tree (has tree leafs)',
      exception: 'property "scriptTree" of type \\?isTaptree, got Array',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        scriptTree: [
          {
            output:
              '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
            version: 192,
          },
          [
            {
              output:
                'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
              version: 192,
            },
            {
              output:
                'c440b462ad48c7a77f94cd4532d8f2119dcebbd7c9764557e62726419b08ad4c OP_CHECKSIG',
              version: 192,
            },
          ],
        ],
        hash: 'b76077013c8e303085e300000000000000000000000000000000000000000000',
      },
    },
    {
      description: 'Script Tree is not a TapTree tree (leaf has no script)',
      exception: 'property "scriptTree" of type \\?isTaptree, got Array',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        scriptTree: [
          {
            output:
              '71981521ad9fc9036687364118fb6ccd2035b96a423c59c5430e98310a11abe2 OP_CHECKSIG',
            version: 192,
          },
          [
            [
              [
                [
                  {
                    output:
                      'd5094d2dbe9b76e2c245a2b89b6006888952e2faa6a149ae318d69e520617748 OP_CHECKSIG',
                    version: 192,
                  },
                  {
                    version: 192,
                  },
                ],
              ],
            ],
          ],
        ],
        hash: 'b76077013c8e303085e300000000000000000000000000000000000000000000',
      },
    },
    {
      description: 'Incorrect redeem version',
      exception: 'Redeem.redeemVersion and witness mismatch',
      arguments: {
        witness: [
          '20d85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8ac',
          'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
        ],
        redeem: {
          output:
            'd85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8 OP_CHECKSIG',
          redeemVersion: 111,
        },
      },
    },
    {
      description: 'Incorrect redeem output',
      exception: 'Redeem.output and witness mismatch',
      arguments: {
        witness: [
          '20d85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8ac',
          'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
        ],
        redeem: {
          output:
            'd85a959b0290bf19bb89ed43c916be835475d013da4b362117393e0000000000 OP_CHECKSIG',
          redeemVersion: 192,
        },
      },
    },
    {
      description: 'Incorrect redeem witness',
      exception: 'Redeem.witness and witness mismatch',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
        redeem: {
          output:
            'OP_DROP c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0 OP_CHECKSIG',
          redeemVersion: 192,
          witness: [
            '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e0100000000000000000000',
            '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          ],
        },
      },
    },
    {
      description: 'Incorrect redeem output ASM',
      exception: 'Redeem.output is invalid',
      arguments: {
        witness: [
          '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602',
          '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac',
          'c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c',
        ],
        redeem: {
          output: '',
          redeemVersion: 192,
          witness: [
            '9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e0100000000000000000000',
            '5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba',
          ],
        },
      },
    },
    {
      description: 'Redeem script not in tree',
      exception: 'Redeem script not in tree',
      options: {},
      arguments: {
        internalPubkey:
          '9fa5ffb68821cf559001caa0577eeea4978b29416def328a707b15e91701a2f7',
        scriptTree: {
          output:
            '83d8ee77a0f3a32a5cea96fd1624d623b836c1e5d1ac2dcde46814b619320c18 OP_CHECKSIG',
        },
        redeem: {
          output:
            '83d8ee77a0f3a32a5cea96fd1624d623b836c1e5d1ac2dcde46814b619320c19 OP_CHECKSIG',
        },
      },
    },
  ],
  dynamic: {
    depends: {},
    details: [],
  },
};

export default p2tr;
