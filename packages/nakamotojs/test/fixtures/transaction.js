const fixtures = {
    valid: [
        {
            description: 'Standard transaction (1:1)',
            id: 'a0ff943d3f644d8832b1fa74be4d0ad2577615dc28a7ef74ff8c271b603a082a',
            hash: '2a083a601b278cff74efa728dc157657d20a4dbe74fab132884d643f3d94ffa0',
            hex: '0100000001f1fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe000000006b4830450221008732a460737d956fd94d49a31890b2908f7ed7025a9c1d0f25e43290f1841716022004fa7d608a291d44ebbbebbadaac18f943031e7de39ef3bf9920998c43e60c0401210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ffffffff01a0860100000000001976a914c42e7ef92fdb603af844d064faad95db9bcdfd3d88ac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: 'f1fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe',
                        index: 0,
                        script: '30450221008732a460737d956fd94d49a31890b2908f7ed7025a9c1d0f25e43290f1841716022004fa7d608a291d44ebbbebbadaac18f943031e7de39ef3bf9920998c43e60c0401 0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                    },
                ],
                outs: [
                    {
                        script: 'OP_DUP OP_HASH160 c42e7ef92fdb603af844d064faad95db9bcdfd3d OP_EQUALVERIFY OP_CHECKSIG',
                        value: 100000n,
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 192,
            weight: 768,
        },
        {
            description: 'Standard transaction (2:2)',
            id: 'fcdd6d89c43e76dcff94285d9b6e31d5c60cb5e397a76ebc4920befad30907bc',
            hash: 'bc0709d3fabe2049bc6ea797e3b50cc6d5316e9b5d2894ffdc763ec4896dddfc',
            hex: '0100000002f1fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe000000006b483045022100e661badd8d2cf1af27eb3b82e61b5d3f5d5512084591796ae31487f5b82df948022006df3c2a2cac79f68e4b179f4bbb8185a0bb3c4a2486d4405c59b2ba07a74c2101210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798fffffffff2fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe0100000083483045022100be54a46a44fb7e6bf4ebf348061d0dace7ddcbb92d4147ce181cf4789c7061f0022068ccab2a89a47fc29bb5074bca99ae846ab446eecf3c3aaeb238a13838783c78012102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee517a9147ccb85f0ab2d599bc17246c98babd5a20b1cdc7687000000800250c30000000000001976a914c42e7ef92fdb603af844d064faad95db9bcdfd3d88acf04902000000000017a9147ccb85f0ab2d599bc17246c98babd5a20b1cdc768700000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: 'f1fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe',
                        index: 0,
                        script: '3045022100e661badd8d2cf1af27eb3b82e61b5d3f5d5512084591796ae31487f5b82df948022006df3c2a2cac79f68e4b179f4bbb8185a0bb3c4a2486d4405c59b2ba07a74c2101 0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                        sequence: 4294967295,
                    },
                    {
                        hash: 'f2fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe',
                        index: 1,
                        script: '3045022100be54a46a44fb7e6bf4ebf348061d0dace7ddcbb92d4147ce181cf4789c7061f0022068ccab2a89a47fc29bb5074bca99ae846ab446eecf3c3aaeb238a13838783c7801 02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5 a9147ccb85f0ab2d599bc17246c98babd5a20b1cdc7687',
                        sequence: 2147483648,
                    },
                ],
                outs: [
                    {
                        script: 'OP_DUP OP_HASH160 c42e7ef92fdb603af844d064faad95db9bcdfd3d OP_EQUALVERIFY OP_CHECKSIG',
                        value: 50000n,
                    },
                    {
                        script: 'OP_HASH160 7ccb85f0ab2d599bc17246c98babd5a20b1cdc76 OP_EQUAL',
                        value: 150000n,
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 396,
            weight: 1584,
        },
        {
            description: 'Standard transaction (14:2)',
            id: '39d57bc27f72e904d81f6b5ef7b4e6e17fa33a06b11e5114a43435830d7b5563',
            hash: '63557b0d833534a414511eb1063aa37fe1e6b4f75e6b1fd804e9727fc27bd539',
            hex: '010000000ee7b73e229790c1e79a02f0c871813b3cf26a4156c5b8d942e88b38fe8d3f43a0000000008c493046022100fd3d8fef44fb0962ba3f07bee1d4cafb84e60e38e6c7d9274504b3638a8d2f520221009fce009044e615b6883d4bf62e04c48f9fe236e19d644b082b2f0ae5c98e045c014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff7bfc005f3880a606027c7cd7dd02a0f6a6572eeb84a91aa158311be13695a7ea010000008b483045022100e2e61c40f26e2510b76dc72ea2f568ec514fce185c719e18bca9caaef2b20e9e02207f1100fc79eb0584e970c7f18fb226f178951d481767b4092d50d13c50ccba8b014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff0e0f8e6bf951fbb84d7d8ef833a1cbf5bb046ea7251973ac6e7661c755386ee3010000008a473044022048f1611e403710f248f7caf479965a6a5f63cdfbd9a714fef4ec1b68331ade1d022074919e79376c363d4575b2fc21513d5949471703efebd4c5ca2885e810eb1fa4014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffe6f17f35bf9f0aa7a4242ab3e29edbdb74c5274bf263e53043dddb8045cb585b000000008b483045022100886c07cad489dfcf4b364af561835d5cf985f07adf8bd1d5bd6ddea82b0ce6b2022045bdcbcc2b5fc55191bb997039cf59ff70e8515c56b62f293a9add770ba26738014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffe6f17f35bf9f0aa7a4242ab3e29edbdb74c5274bf263e53043dddb8045cb585b010000008a4730440220535d49b819fdf294d27d82aff2865ed4e18580f0ca9796d793f611cb43a44f47022019584d5e300c415f642e37ba2a814a1e1106b4a9b91dc2a30fb57ceafe041181014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffd3051677216ea53baa2e6d7f6a75434ac338438c59f314801c8496d1e6d1bf6d010000008b483045022100bf612b0fa46f49e70ab318ca3458d1ed5f59727aa782f7fac5503f54d9b43a590220358d7ed0e3cee63a5a7e972d9fad41f825d95de2fd0c5560382468610848d489014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff1e751ccc4e7d973201e9174ec78ece050ef2fadd6a108f40f76a9fa314979c31010000008b483045022006e263d5f73e05c48a603e3bd236e8314e5420721d5e9020114b93e8c9220e1102210099d3dead22f4a792123347a238c87e67b55b28a94a0bb7793144cc7ad94a0168014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff25c4cf2c61743b3f4252d921d937cca942cf32e4f3fa4a544d0b26f014337084010000008a47304402207d6e87588be47bf2d97eaf427bdd992e9d6b306255711328aee38533366a88b50220623099595ae442cb77eaddb3f91753a4fc9df56fde69cfec584c7f97e05533c8014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffecd93c87eb43c48481e6694904305349bdea94b01104579fa9f02bff66c89663010000008a473044022020f59498aee0cf82cb113768ef3cb721000346d381ff439adb4d405f791252510220448de723aa59412266fabbc689ec25dc94b1688c27a614982047513a80173514014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffa1fdc0a79ff98d5b6154176e321c22f4f8450dbd950bd013ad31135f5604411e010000008b48304502210088167867f87327f9c0db0444267ff0b6a026eedd629d8f16fe44a34c18e706bf0220675c8baebf89930e2d6e4463adefc50922653af99375242e38f5ee677418738a014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffb89e8249c3573b58bf1ec7433185452dd57ab8e1daab01c3cc6ddc8b66ad3de8000000008b4830450220073d50ac5ec8388d5b3906921f9368c31ad078c8e1fb72f26d36b533f35ee327022100c398b23e6692e11dca8a1b64aae2ff70c6a781ed5ee99181b56a2f583a967cd4014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff45ee07e182084454dacfad1e61b04ffdf9c7b01003060a6c841a01f4fff8a5a0010000008b483045022100991d1bf60c41358f08b20e53718a24e05ac0608915df4f6305a5b47cb61e5da7022003f14fc1cc5b737e2c3279a4f9be1852b49dbb3d9d6cc4c8af6a666f600dced8014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff4cba12549f1d70f8e60aea8b546c8357f7c099e7c7d9d8691d6ee16e7dfa3170010000008c493046022100f14e2b0ef8a8e206db350413d204bc0a5cd779e556b1191c2d30b5ec023cde6f022100b90b2d2bf256c98a88f7c3a653b93cec7d25bb6a517db9087d11dbd189e8851c014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffffa4b3aed39eb2a1dc6eae4609d9909724e211c153927c230d02bd33add3026959010000008b483045022100a8cebb4f1c58f5ba1af91cb8bd4a2ed4e684e9605f5a9dc8b432ed00922d289d0220251145d2d56f06d936fd0c51fa884b4a6a5fafd0c3318f72fb05a5c9aa372195014104aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19fffffffff0240d52303000000001976a914167c3e1f10cc3b691c73afbdb211e156e3e3f25c88ac15462e00000000001976a914290f7d617b75993e770e5606335fa0999a28d71388ac00000000',
            raw: {
                version: 1,
                locktime: 0,
                ins: [
                    {
                        hash: 'e7b73e229790c1e79a02f0c871813b3cf26a4156c5b8d942e88b38fe8d3f43a0',
                        index: 0,
                        script: '3046022100fd3d8fef44fb0962ba3f07bee1d4cafb84e60e38e6c7d9274504b3638a8d2f520221009fce009044e615b6883d4bf62e04c48f9fe236e19d644b082b2f0ae5c98e045c01 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                        sequence: null,
                    },
                    {
                        hash: '7bfc005f3880a606027c7cd7dd02a0f6a6572eeb84a91aa158311be13695a7ea',
                        index: 1,
                        script: '3045022100e2e61c40f26e2510b76dc72ea2f568ec514fce185c719e18bca9caaef2b20e9e02207f1100fc79eb0584e970c7f18fb226f178951d481767b4092d50d13c50ccba8b01 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: '0e0f8e6bf951fbb84d7d8ef833a1cbf5bb046ea7251973ac6e7661c755386ee3',
                        index: 1,
                        script: '3044022048f1611e403710f248f7caf479965a6a5f63cdfbd9a714fef4ec1b68331ade1d022074919e79376c363d4575b2fc21513d5949471703efebd4c5ca2885e810eb1fa401 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'e6f17f35bf9f0aa7a4242ab3e29edbdb74c5274bf263e53043dddb8045cb585b',
                        index: 0,
                        script: '3045022100886c07cad489dfcf4b364af561835d5cf985f07adf8bd1d5bd6ddea82b0ce6b2022045bdcbcc2b5fc55191bb997039cf59ff70e8515c56b62f293a9add770ba2673801 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'e6f17f35bf9f0aa7a4242ab3e29edbdb74c5274bf263e53043dddb8045cb585b',
                        index: 1,
                        script: '30440220535d49b819fdf294d27d82aff2865ed4e18580f0ca9796d793f611cb43a44f47022019584d5e300c415f642e37ba2a814a1e1106b4a9b91dc2a30fb57ceafe04118101 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'd3051677216ea53baa2e6d7f6a75434ac338438c59f314801c8496d1e6d1bf6d',
                        index: 1,
                        script: '3045022100bf612b0fa46f49e70ab318ca3458d1ed5f59727aa782f7fac5503f54d9b43a590220358d7ed0e3cee63a5a7e972d9fad41f825d95de2fd0c5560382468610848d48901 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: '1e751ccc4e7d973201e9174ec78ece050ef2fadd6a108f40f76a9fa314979c31',
                        index: 1,
                        script: '3045022006e263d5f73e05c48a603e3bd236e8314e5420721d5e9020114b93e8c9220e1102210099d3dead22f4a792123347a238c87e67b55b28a94a0bb7793144cc7ad94a016801 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: '25c4cf2c61743b3f4252d921d937cca942cf32e4f3fa4a544d0b26f014337084',
                        index: 1,
                        script: '304402207d6e87588be47bf2d97eaf427bdd992e9d6b306255711328aee38533366a88b50220623099595ae442cb77eaddb3f91753a4fc9df56fde69cfec584c7f97e05533c801 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'ecd93c87eb43c48481e6694904305349bdea94b01104579fa9f02bff66c89663',
                        index: 1,
                        script: '3044022020f59498aee0cf82cb113768ef3cb721000346d381ff439adb4d405f791252510220448de723aa59412266fabbc689ec25dc94b1688c27a614982047513a8017351401 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'a1fdc0a79ff98d5b6154176e321c22f4f8450dbd950bd013ad31135f5604411e',
                        index: 1,
                        script: '304502210088167867f87327f9c0db0444267ff0b6a026eedd629d8f16fe44a34c18e706bf0220675c8baebf89930e2d6e4463adefc50922653af99375242e38f5ee677418738a01 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'b89e8249c3573b58bf1ec7433185452dd57ab8e1daab01c3cc6ddc8b66ad3de8',
                        index: 0,
                        script: '30450220073d50ac5ec8388d5b3906921f9368c31ad078c8e1fb72f26d36b533f35ee327022100c398b23e6692e11dca8a1b64aae2ff70c6a781ed5ee99181b56a2f583a967cd401 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: '45ee07e182084454dacfad1e61b04ffdf9c7b01003060a6c841a01f4fff8a5a0',
                        index: 1,
                        script: '3045022100991d1bf60c41358f08b20e53718a24e05ac0608915df4f6305a5b47cb61e5da7022003f14fc1cc5b737e2c3279a4f9be1852b49dbb3d9d6cc4c8af6a666f600dced801 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: '4cba12549f1d70f8e60aea8b546c8357f7c099e7c7d9d8691d6ee16e7dfa3170',
                        index: 1,
                        script: '3046022100f14e2b0ef8a8e206db350413d204bc0a5cd779e556b1191c2d30b5ec023cde6f022100b90b2d2bf256c98a88f7c3a653b93cec7d25bb6a517db9087d11dbd189e8851c01 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                    {
                        hash: 'a4b3aed39eb2a1dc6eae4609d9909724e211c153927c230d02bd33add3026959',
                        index: 1,
                        script: '3045022100a8cebb4f1c58f5ba1af91cb8bd4a2ed4e684e9605f5a9dc8b432ed00922d289d0220251145d2d56f06d936fd0c51fa884b4a6a5fafd0c3318f72fb05a5c9aa37219501 04aa592c859fd00ed2a02609aad3a1bf72e0b42de67713e632c70a33cc488c15598a0fb419370a54d1c275b44380e8777fc01b6dc3cd43a416c6bab0e30dc1e19f',
                    },
                ],
                outs: [
                    {
                        value: 52680000n,
                        script: 'OP_DUP OP_HASH160 167c3e1f10cc3b691c73afbdb211e156e3e3f25c OP_EQUALVERIFY OP_CHECKSIG',
                    },
                    {
                        value: 3032597n,
                        script: 'OP_DUP OP_HASH160 290f7d617b75993e770e5606335fa0999a28d713 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
            },
            coinbase: false,
            virtualSize: 2596,
            weight: 10384,
        },
        {
            description: 'Coinbase transaction',
            id: '8e070d4eb85eb02e02dd938d6552316b9d723330707870c518064b7a0d232da3',
            hash: 'a32d230d7a4b0618c57078703033729d6b3152658d93dd022eb05eb84e0d078e',
            hex: '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff29032832051c4d696e656420627920416e74506f6f6c20626a343a45ef0454c5de8d5e5300004e2c0000ffffffff01414f1995000000001976a914b05793fe86a9f51a5f5ae3a6f07fd31932128a3f88ac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '0000000000000000000000000000000000000000000000000000000000000000',
                        index: 4294967295,
                        data: '032832051c4d696e656420627920416e74506f6f6c20626a343a45ef0454c5de8d5e5300004e2c0000',
                    },
                ],
                outs: [
                    {
                        script: 'OP_DUP OP_HASH160 b05793fe86a9f51a5f5ae3a6f07fd31932128a3f OP_EQUALVERIFY OP_CHECKSIG',
                        value: 2501463873n,
                    },
                ],
                locktime: 0,
            },
            coinbase: true,
            virtualSize: 126,
            weight: 504,
        },
        {
            description: 'Transaction that ignores script chunking rules - Bug #367',
            id: 'ebc9fa1196a59e192352d76c0f6e73167046b9d37b8302b6bb6968dfd279b767',
            hash: '67b779d2df6869bbb602837bd3b9467016736e0f6cd75223199ea59611fac9eb',
            hex: '01000000019ac03d5ae6a875d970128ef9086cef276a1919684a6988023cc7254691d97e6d010000006b4830450221009d41dc793ba24e65f571473d40b299b6459087cea1509f0d381740b1ac863cb6022039c425906fcaf51b2b84d8092569fb3213de43abaff2180e2a799d4fcb4dd0aa012102d5ede09a8ae667d0f855ef90325e27f6ce35bbe60a1e6e87af7f5b3c652140fdffffffff080100000000000000010101000000000000000202010100000000000000014c0100000000000000034c02010100000000000000014d0100000000000000044dffff010100000000000000014e0100000000000000064effffffff0100000000',
            raw: {
                version: 1,
                locktime: 0,
                ins: [
                    {
                        hash: '9ac03d5ae6a875d970128ef9086cef276a1919684a6988023cc7254691d97e6d',
                        index: 1,
                        script: '30450221009d41dc793ba24e65f571473d40b299b6459087cea1509f0d381740b1ac863cb6022039c425906fcaf51b2b84d8092569fb3213de43abaff2180e2a799d4fcb4dd0aa01 02d5ede09a8ae667d0f855ef90325e27f6ce35bbe60a1e6e87af7f5b3c652140fd',
                    },
                ],
                outs: [
                    {
                        data: '01',
                        value: 1n,
                    },
                    {
                        data: '0201',
                        value: 1n,
                    },
                    {
                        data: '4c',
                        value: 1n,
                    },
                    {
                        data: '4c0201',
                        value: 1n,
                    },
                    {
                        data: '4d',
                        value: 1n,
                    },
                    {
                        data: '4dffff01',
                        value: 1n,
                    },
                    {
                        data: '4e',
                        value: 1n,
                    },
                    {
                        data: '4effffffff01',
                        value: 1n,
                    },
                ],
            },
            coinbase: false,
            virtualSize: 249,
            weight: 996,
        },
        {
            description: 'P2PK',
            id: '8d4733995be9b3331a65eeb31bce24b213d4fabcbadf7f6634a8fea442c13e6a',
            hash: '6a3ec142a4fea834667fdfbabcfad413b224ce1bb3ee651a33b3e95b9933478d',
            hex: '010000000193aef40ae141694895e99e18e49d0181b086dd7c011c0241175c6eaf320099970000000049483045022100e57eba5380dcc8a7bdb5370b423dadd43070e1ca268f94bc97b2ded55ca45e9502206a43151c8af03a00f0ac86526d07981e303fc0daea8c6ed435abe8961533046d01ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '93aef40ae141694895e99e18e49d0181b086dd7c011c0241175c6eaf32009997',
                        index: 0,
                        script: '3045022100e57eba5380dcc8a7bdb5370b423dadd43070e1ca268f94bc97b2ded55ca45e9502206a43151c8af03a00f0ac86526d07981e303fc0daea8c6ed435abe8961533046d01',
                        value: 80000n,
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 158,
            weight: 632,
        },
        {
            description: 'P2SH P2PK',
            id: 'd4ebb5e09c06dd375f265b51eb7f1a14d12deba71329500e2a00a905fdfdc27d',
            hash: '7dc2fdfd05a9002a0e502913a7eb2dd1141a7feb515b265f37dd069ce0b5ebd4',
            hex: '0100000001a30e865fa60f6c25a8b218bb5a6b9acc7cf3f1db2f2e3a7114b51af5d6ae811f000000006c473044022026d2b56b6cb0269bf4e80dd655b9e917019e2ccef57f4b858d03bb45a2da59d9022010519a7f327f03e7c9613e0694f929544af29d3682e7ec8f19147e7a86651ecd012321038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bacffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: 'a30e865fa60f6c25a8b218bb5a6b9acc7cf3f1db2f2e3a7114b51af5d6ae811f',
                        index: 0,
                        script: '3044022026d2b56b6cb0269bf4e80dd655b9e917019e2ccef57f4b858d03bb45a2da59d9022010519a7f327f03e7c9613e0694f929544af29d3682e7ec8f19147e7a86651ecd01 21038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bac',
                        value: 80000n,
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                        scriptHex: '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 193,
            weight: 772,
        },
        {
            description: 'P2WSH P2PK',
            id: '60f04167a0c94d6439102f7fde9ad77c08a8716419805e77ef66b286cc5c7f87',
            hash: '877f5ccc86b266ef775e80196471a8087cd79ade7f2f1039644dc9a06741f060',
            hex: '01000000014533a3bc1e039bd787656068e135aaee10aee95a64776bfc047ee6a7c1ebdd2f0000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '010000000001014533a3bc1e039bd787656068e135aaee10aee95a64776bfc047ee6a7c1ebdd2f0000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac02473044022039725bb7291a14dd182dafdeaf3ea0d5c05c34f4617ccbaa46522ca913995c4e02203b170d072ed2e489e7424ad96d8fa888deb530be2d4c5d9aaddf111a7efdb2d3012321038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '4533a3bc1e039bd787656068e135aaee10aee95a64776bfc047ee6a7c1ebdd2f',
                        index: 0,
                        witness: [
                            '3044022039725bb7291a14dd182dafdeaf3ea0d5c05c34f4617ccbaa46522ca913995c4e02203b170d072ed2e489e7424ad96d8fa888deb530be2d4c5d9aaddf111a7efdb2d301',
                            '21038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bac',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                        scriptHex: '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 113,
            weight: 451,
        },
        {
            description: 'P2SH P2WSH P2PK',
            id: 'da24fd5a422f72e3bde593628c2b47ff9ca7454e1f3ba5fb916344c218d31052',
            hash: '5210d318c2446391fba53b1f4e45a79cff472b8c6293e5bde3722f425afd24da',
            hex: '0100000001e0779d448aaa203a96b3de14d0482e26dd75a4278ae5bb6d7cc18e6874f3866000000000232200200f9ea7bae7166c980169059e39443ed13324495b0d6678ce716262e879591210ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '01000000000101e0779d448aaa203a96b3de14d0482e26dd75a4278ae5bb6d7cc18e6874f3866000000000232200200f9ea7bae7166c980169059e39443ed13324495b0d6678ce716262e879591210ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac024730440220014207a5f0601ed7b3c3f9d82309b32e8f76dd6776a55cb5f8684b9ff029e0850220693afd7b69471b51d9354cc1a956b68b8d48e32f6b0ad7a19bb5dd3e4499179a012321038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: 'e0779d448aaa203a96b3de14d0482e26dd75a4278ae5bb6d7cc18e6874f38660',
                        index: 0,
                        script: '00200f9ea7bae7166c980169059e39443ed13324495b0d6678ce716262e879591210',
                        witness: [
                            '30440220014207a5f0601ed7b3c3f9d82309b32e8f76dd6776a55cb5f8684b9ff029e0850220693afd7b69471b51d9354cc1a956b68b8d48e32f6b0ad7a19bb5dd3e4499179a01',
                            '21038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bac',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 148,
            weight: 591,
        },
        {
            description: 'P2PKH',
            id: 'c7a77aeadf529759c8db9b3f205d690cdaed3df0eaf441ead648086e85a6a280',
            hash: '80a2a6856e0848d6ea41f4eaf03dedda0c695d203f9bdbc8599752dfea7aa7c7',
            hex: '010000000176d7b05b96e69d9760bacf14e496ea01085eff32be8f4e08b299eb92057826e5000000006b4830450221009bd6ff2561437155913c289923175d3f114cca1c0e2bc5989315d5261502c2c902201b71ad90dce076a5eb872330ed729e7c2c4bc2d0513efff099dbefb3b62eab4f0121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2bffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '76d7b05b96e69d9760bacf14e496ea01085eff32be8f4e08b299eb92057826e5',
                        index: 0,
                        script: '30450221009bd6ff2561437155913c289923175d3f114cca1c0e2bc5989315d5261502c2c902201b71ad90dce076a5eb872330ed729e7c2c4bc2d0513efff099dbefb3b62eab4f01 038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b',
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 192,
            weight: 768,
        },
        {
            description: 'P2SH P2PKH',
            id: '0b8fa64f89b95666a23e424fe94e9114806726be9753e140dbd74c0d673c9593',
            hash: '93953c670d4cd7db40e15397be26678014914ee94f423ea26656b9894fa68f0b',
            hex: '01000000014b9ffc17c3cce03ee66980bf32d36aaa13462980c3af9d9d29ec6b97ab1c91650000000084473044022003d738d855d0c54a419ac62ebe1a1c0bf2dc6993c9585adb9a8666736658107002204d57ff62ee7efae6df73430bba62494faeba8c125a4abcf2488757a4f8877dd50121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b1976a914851a33a5ef0d4279bd5854949174e2c65b1d450088acffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '4b9ffc17c3cce03ee66980bf32d36aaa13462980c3af9d9d29ec6b97ab1c9165',
                        index: 0,
                        script: '3044022003d738d855d0c54a419ac62ebe1a1c0bf2dc6993c9585adb9a8666736658107002204d57ff62ee7efae6df73430bba62494faeba8c125a4abcf2488757a4f8877dd501 038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b 76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 217,
            weight: 868,
        },
        {
            description: 'P2WSH P2PKH',
            id: '62c62316f80beb10d9b1ce9183eb66e7e18a18324ca5f5e6f839be03f64aba83',
            hash: '83ba4af603be39f8e6f5a54c32188ae1e766eb8391ceb1d910eb0bf81623c662',
            hex: '010000000123539877e39a273819006de1c433e09f9e9af201fc178dd0f2cf2eaa5ad53b480000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '0100000000010123539877e39a273819006de1c433e09f9e9af201fc178dd0f2cf2eaa5ad53b480000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac03483045022100f02a82b0a94a5d5dc4d2127ac34be62cb066713d71d56bdf5ef7810ab57a157302205f24abdde1dab554a02edcf378e98828024e57272e5e474a5b04accdca080a030121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b1976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '23539877e39a273819006de1c433e09f9e9af201fc178dd0f2cf2eaa5ad53b48',
                        index: 0,
                        script: '',
                        witness: [
                            '3045022100f02a82b0a94a5d5dc4d2127ac34be62cb066713d71d56bdf5ef7810ab57a157302205f24abdde1dab554a02edcf378e98828024e57272e5e474a5b04accdca080a0301',
                            '038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b',
                            '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                        scriptHex: '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 119,
            weight: 476,
        },
        {
            description: 'P2SH P2WSH P2PKH',
            id: '2ef1431ec41a75791b75d16526f23534ae66d8d4abfb483d98d14bcb259311c0',
            hash: 'c0119325cb4bd1983d48fbabd4d866ae3435f22665d1751b79751ac41e43f12e',
            hex: '0100000001363dfbfe2566db77e3b1195bedf1d0daeb9ce526cd7611ba81759b2654ce415c0000000023220020578db4b54a6961060b71385c17d3280379a557224c52b11b19a3a1c1eef606a0ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '01000000000101363dfbfe2566db77e3b1195bedf1d0daeb9ce526cd7611ba81759b2654ce415c0000000023220020578db4b54a6961060b71385c17d3280379a557224c52b11b19a3a1c1eef606a0ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac03483045022100c8bd5ebb26ba6719158650c3e7c5e80be4c886ba025c44cc41f5149b3114705a02203ac6e1f38f6c081d506f28f1b5e38ebec9e0f0fa911d0e3f68d48d8b0e77b34b0121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b1976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '363dfbfe2566db77e3b1195bedf1d0daeb9ce526cd7611ba81759b2654ce415c',
                        index: 0,
                        script: '0020578db4b54a6961060b71385c17d3280379a557224c52b11b19a3a1c1eef606a0',
                        witness: [
                            '3045022100c8bd5ebb26ba6719158650c3e7c5e80be4c886ba025c44cc41f5149b3114705a02203ac6e1f38f6c081d506f28f1b5e38ebec9e0f0fa911d0e3f68d48d8b0e77b34b01',
                            '038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b',
                            '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 154,
            weight: 616,
        },
        {
            description: 'Multisig',
            id: '7f5d96a866a815f5a1896fcd3b49cd00ac4c366a371fe8555f124e628e977a5e',
            hash: '5e7a978e624e125f55e81f376a364cac00cd493bcd6f89a1f515a866a8965d7f',
            hex: '010000000179310ec46e734b3490ee839c5ae4a09d28561ee9fff2d051f733d201f958d6d2000000004a00483045022100d269531f120f377ed2f94f42bef893ff2fe6544ac97fb477fa291bc6cfb7647e02200983f6a5bbd4ce6cf97f571995634805a7324cc5d8353ed954fa62477b0fcd0901ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '79310ec46e734b3490ee839c5ae4a09d28561ee9fff2d051f733d201f958d6d2',
                        index: 0,
                        script: 'OP_0 3045022100d269531f120f377ed2f94f42bef893ff2fe6544ac97fb477fa291bc6cfb7647e02200983f6a5bbd4ce6cf97f571995634805a7324cc5d8353ed954fa62477b0fcd0901',
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 159,
            weight: 636,
        },
        {
            description: 'P2SH Multisig',
            id: '3aef827e4306bab01f118a8eccad74713bcd1695362caf9fed55202ed54ef88b',
            hash: '8bf84ed52e2055ed9faf2c369516cd3b7174adcc8e8a111fb0ba06437e82ef3a',
            hex: '010000000152882c661c49dd2f53bd9ced7e9f44b184888ad2fe7d86737f0efaa7aecdced1000000006f00473044022025f2e161f0a97888df948f4dcc7c04fe502510b8d8260ca9920f38d55e4d17720220271b6843224b3a34542a4df31781d048da56ee46b8c5fb99043e30abd527b2d801255121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51aeffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '52882c661c49dd2f53bd9ced7e9f44b184888ad2fe7d86737f0efaa7aecdced1',
                        index: 0,
                        script: 'OP_0 3044022025f2e161f0a97888df948f4dcc7c04fe502510b8d8260ca9920f38d55e4d17720220271b6843224b3a34542a4df31781d048da56ee46b8c5fb99043e30abd527b2d801 5121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51ae',
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                        scriptHex: '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 196,
            weight: 784,
        },
        {
            description: 'P2WSH Multisig',
            id: '03e6b741d25cbd061b8d0999a521788ef90263dd8ba96d91c2136a4386afdf8e',
            hash: '8edfaf86436a13c2916da98bdd6302f98e7821a599098d1b06bd5cd241b7e603',
            hex: '0100000001c1eced6216de0889d4629ff64a8af8e8ec6d0b414de0c57b46c02cc303d321fe0000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '01000000000101c1eced6216de0889d4629ff64a8af8e8ec6d0b414de0c57b46c02cc303d321fe0000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac0300483045022100d4c0cbdb45915b8a3162362fa5f74556de919aeda5337fc44a7fb000e833460d022017742c37d7a061e2ae3a086c7c585c9c85e5d31af468d3e00045c0f35b8f8eb601255121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51ae00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: 'c1eced6216de0889d4629ff64a8af8e8ec6d0b414de0c57b46c02cc303d321fe',
                        index: 0,
                        script: '',
                        witness: [
                            '',
                            '3045022100d4c0cbdb45915b8a3162362fa5f74556de919aeda5337fc44a7fb000e833460d022017742c37d7a061e2ae3a086c7c585c9c85e5d31af468d3e00045c0f35b8f8eb601',
                            '5121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51ae',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 114,
            weight: 455,
        },
        {
            description: 'P2SH P2WSH Multisig',
            id: 'e77fd9ea35346e295e1e15de9724fff42b5c127da4c5447a4ffddd361f66b1c1',
            hash: 'c1b1661f36ddfd4f7a44c5a47d125c2bf4ff2497de151e5e296e3435ead97fe7',
            hex: '01000000013a5a2ab0223d3b504b52af76d650329750666fbf1be13d4cb08d0d9fc550a47d00000000232200201b8c0c2878c5634c3ce738cdc568c592e99783dbd28ff4c6cb5b7b4675d9ee99ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '010000000001013a5a2ab0223d3b504b52af76d650329750666fbf1be13d4cb08d0d9fc550a47d00000000232200201b8c0c2878c5634c3ce738cdc568c592e99783dbd28ff4c6cb5b7b4675d9ee99ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac0300483045022100c97a5e205ce0023d3d44f846abf1f0e21b6f2646bd2496bbe92e4333fe4401be02201247e047d669f713582713e35d2eba430abc3d75a924bb500362bf47d6234ed501255121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51ae00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '3a5a2ab0223d3b504b52af76d650329750666fbf1be13d4cb08d0d9fc550a47d',
                        index: 0,
                        script: '00201b8c0c2878c5634c3ce738cdc568c592e99783dbd28ff4c6cb5b7b4675d9ee99',
                        witness: [
                            '',
                            '3045022100c97a5e205ce0023d3d44f846abf1f0e21b6f2646bd2496bbe92e4333fe4401be02201247e047d669f713582713e35d2eba430abc3d75a924bb500362bf47d6234ed501',
                            '5121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b51ae',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                        scriptHex: '76a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 149,
            weight: 595,
        },
        {
            description: 'P2WKH',
            id: '10bbdf7e9301bc21f1da8684f25fd66bc1314904c30da25a8ebf967c58c89269',
            hash: '6992c8587c96bf8e5aa20dc3044931c16bd65ff28486daf121bc01937edfbb10',
            hex: '010000000133defbe3e28860007ff3e21222774c220cb35d554fa3e3796d25bf8ee983e1080000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '0100000000010133defbe3e28860007ff3e21222774c220cb35d554fa3e3796d25bf8ee983e1080000000000ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac0248304502210097c3006f0b390982eb47f762b2853773c6cedf83668a22d710f4c13c4fd6b15502205e26ef16a81fc818a37f3a34fc6d0700e61100ea6c6773907c9c046042c440340121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '33defbe3e28860007ff3e21222774c220cb35d554fa3e3796d25bf8ee983e108',
                        index: 0,
                        script: '',
                        witness: [
                            '304502210097c3006f0b390982eb47f762b2853773c6cedf83668a22d710f4c13c4fd6b15502205e26ef16a81fc818a37f3a34fc6d0700e61100ea6c6773907c9c046042c4403401',
                            '038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 113,
            weight: 450,
        },
        {
            description: 'P2SH P2WKH',
            id: 'a0dd6714722a577c5db08f740cd1525f5383f8771dd0ebecd9ae96eb6623408a',
            hash: '8a402366eb96aed9ecebd01d77f883535f52d10c748fb05d7c572a721467dda0',
            hex: '01000000015df9a0b9ade2d835881704e0f53b51a4b19ecfc794ea1f3555783dd7f68659ce0000000017160014851a33a5ef0d4279bd5854949174e2c65b1d4500ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac00000000',
            whex: '010000000001015df9a0b9ade2d835881704e0f53b51a4b19ecfc794ea1f3555783dd7f68659ce0000000017160014851a33a5ef0d4279bd5854949174e2c65b1d4500ffffffff0160ea0000000000001976a914851a33a5ef0d4279bd5854949174e2c65b1d450088ac02483045022100cb3929c128fec5108071b662e5af58e39ac8708882753a421455ca80462956f6022030c0f4738dd1a13fc7a34393002d25c6e8a6399f29c7db4b98f53a9475d94ca20121038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b00000000',
            raw: {
                version: 1,
                ins: [
                    {
                        hash: '5df9a0b9ade2d835881704e0f53b51a4b19ecfc794ea1f3555783dd7f68659ce',
                        index: 0,
                        script: '0014851a33a5ef0d4279bd5854949174e2c65b1d4500',
                        witness: [
                            '3045022100cb3929c128fec5108071b662e5af58e39ac8708882753a421455ca80462956f6022030c0f4738dd1a13fc7a34393002d25c6e8a6399f29c7db4b98f53a9475d94ca201',
                            '038de63cf582d058a399a176825c045672d5ff8ea25b64d28d4375dcdb14c02b2b',
                        ],
                    },
                ],
                outs: [
                    {
                        value: 60000n,
                        script: 'OP_DUP OP_HASH160 851a33a5ef0d4279bd5854949174e2c65b1d4500 OP_EQUALVERIFY OP_CHECKSIG',
                    },
                ],
                locktime: 0,
            },
            coinbase: false,
            virtualSize: 136,
            weight: 542,
        },
        {
            description: 'Coinbase transaction w/ witness',
            id: 'c881f7b084a367b0603abbcb9c5c639318e6166770e3f9b27a1ee3f8b6a16517',
            hash: '1765a1b6f8e31e7ab2f9e3706716e61893635c9ccbbb3a60b067a384b0f781c8',
            hex: '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff05022b020101ffffffff02c0cf402500000000232103c6c5964853fd00fb3271ac002831c66825102d223c706ce0ee99e73db3be4aa1ac0000000000000000266a24aa21a9edff828eb21f40ab251d9f107792670aba9299028b894a364fda570f6a089dcfe900000000',
            whex: '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff05022b020101ffffffff02c0cf402500000000232103c6c5964853fd00fb3271ac002831c66825102d223c706ce0ee99e73db3be4aa1ac0000000000000000266a24aa21a9edff828eb21f40ab251d9f107792670aba9299028b894a364fda570f6a089dcfe90120000000000000000000000000000000000000000000000000000000000000000000000000',
            raw: {
                version: 2,
                ins: [
                    {
                        hash: '0000000000000000000000000000000000000000000000000000000000000000',
                        index: 4294967295,
                        data: '022b020101',
                        sequence: 4294967295,
                        witness: [
                            '0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                    },
                ],
                outs: [
                    {
                        script: '03c6c5964853fd00fb3271ac002831c66825102d223c706ce0ee99e73db3be4aa1 OP_CHECKSIG',
                        value: 625004480n,
                    },
                    {
                        script: 'OP_RETURN aa21a9edff828eb21f40ab251d9f107792670aba9299028b894a364fda570f6a089dcfe9',
                        value: 0n,
                    },
                ],
                locktime: 0,
            },
            coinbase: true,
            virtualSize: 156,
            weight: 624,
        },
    ],
    hashForSignature: [
        {
            description: 'Out of range inIndex',
            txHex: '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01e8030000000000000000000000',
            inIndex: 2,
            script: 'OP_0',
            type: 0,
            hash: '0000000000000000000000000000000000000000000000000000000000000001',
        },
        {
            description: 'inIndex > nOutputs (SIGHASH_SINGLE)',
            txHex: '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01e8030000000000000000000000',
            inIndex: 2,
            script: 'OP_0',
            type: 3,
            hash: '0000000000000000000000000000000000000000000000000000000000000001',
        },
        {
            txHex: '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01e8030000000000000000000000',
            inIndex: 0,
            script: 'OP_0 OP_3',
            type: 0,
            hash: '3d56a632462b9fc9b89eeddcad7dbe476297f34aff7e5f9320e2a99fb5e97136',
        },
        {
            txHex: '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01e8030000000000000000000000',
            inIndex: 0,
            script: 'OP_0 OP_CODESEPARATOR OP_3',
            type: 0,
            hash: '3d56a632462b9fc9b89eeddcad7dbe476297f34aff7e5f9320e2a99fb5e97136',
        },
        {
            txHex: '010000000200000000000000000000000000000000000000000000000000000000000000000000000000ffffffff00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff01e8030000000000000000000000',
            inIndex: 0,
            script: 'OP_0 OP_CODESEPARATOR OP_4',
            type: 0,
            hash: 'fa075877cb54916236806a6562e4a8cdad48adf1268e73d72d1f9fdd867df463',
        },
    ],
    hashForWitnessV0: [
        {
            description: 'Native P2WPKH with SIGHASH_ALL',
            txHex: '0100000002fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f0000000000eeffffffef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a0100000000ffffffff02202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac11000000',
            inIndex: 1,
            script: 'OP_DUP OP_HASH160 1d0f172a0ecb48aee1be1f2687d2963ae33f71a1 OP_EQUALVERIFY OP_CHECKSIG',
            type: 1,
            hash: 'c37af31116d1b27caf68aae9e3ac82f1477929014d5b917657d0eb49478cb670',
            value: 600000000,
        },
        {
            description: 'P2WPKH with SIGHASH_ALL',
            txHex: '0100000001db6b1b20aa0fd7b23880be2ecbd4a98130974cf4748fb66092ac4d3ceb1a54770100000000feffffff02b8b4eb0b000000001976a914a457b684d7f0d539a46a45bbc043f35b59d0d96388ac0008af2f000000001976a914fd270b1ee6abcaea97fea7ad0402e8bd8ad6d77c88ac92040000',
            inIndex: 0,
            script: 'OP_DUP OP_HASH160 79091972186c449eb1ded22b78e40d009bdf0089 OP_EQUALVERIFY OP_CHECKSIG',
            type: 1,
            hash: '64f3b0f4dd2bb3aa1ce8566d220cc74dda9df97d8490cc81d89d735c92e59fb6',
            value: 1000000000,
        },
        {
            description: 'P2WSH with SIGHASH_ALL',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 1,
            hash: '185c0be5263dce5b4bb50a047973c1b6272bfbd0103a89444597dc40b248ee7c',
            value: 987654321,
        },
        {
            description: 'P2WSH with SIGHASH_NONE',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 2,
            hash: 'e9733bc60ea13c95c6527066bb975a2ff29a925e80aa14c213f686cbae5d2f36',
            value: 987654321,
        },
        {
            description: 'P2WSH with SIGHASH_SINGLE',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 3,
            hash: '1e1f1c303dc025bd664acb72e583e933fae4cff9148bf78c157d1e8f78530aea',
            value: 987654321,
        },
        {
            description: 'P2WSH with SIGHASH_ALL | SIGHASH_ANYONECANPAY',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 129,
            hash: '2a67f03e63a6a422125878b40b82da593be8d4efaafe88ee528af6e5a9955c6e',
            value: 987654321,
        },
        {
            description: 'P2WSH with SIGHASH_NONE | SIGHASH_ANYONECANPAY',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 130,
            hash: '781ba15f3779d5542ce8ecb5c18716733a5ee42a6f51488ec96154934e2c890a',
            value: 987654321,
        },
        {
            description: 'P2WSH with SIGHASH_SINGLE | SIGHASH_ANYONECANPAY',
            txHex: '010000000136641869ca081e70f394c6948e8af409e18b619df2ed74aa106c1ca29787b96e0100000000ffffffff0200e9a435000000001976a914389ffce9cd9ae88dcc0631e88a821ffdbe9bfe2688acc0832f05000000001976a9147480a33f950689af511e6e84c138dbbd3c3ee41588ac00000000',
            inIndex: 0,
            script: 'OP_6 0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3 03b28f0c28bfab54554ae8c658ac5c3e0ce6e79ad336331f78c428dd43eea8449b 034b8113d703413d57761b8b9781957b8c0ac1dfe69f492580ca4195f50376ba4a 033400f6afecb833092a9a21cfdf1ed1376e58c5d1f47de74683123987e967a8f4 03a6d48b1131e94ba04d9737d61acdaa1322008af9602b3b14862c07a1789aac16 02d8b661b0b3302ee2f162b09e07a55ad5dfbe673a9f01d9f0c19617681024306b OP_6 OP_CHECKMULTISIG',
            type: 131,
            hash: '511e8e52ed574121fc1b654970395502128263f62662e076dc6baf05c2e6a99b',
            value: 987654321,
        },
    ],
    taprootSigning: [
        {
            description: 'P2TR key path',
            utxos: [
                {
                    scriptHex: '512053a1f6e454df1aa2776a2814a721372d6258050de330b3c6d10ee8f4e0dda343',
                    value: 420000000,
                },
                {
                    scriptHex: '5120147c9c57132f6e7ecddba9800bb0c4449251c92a1e60371ee77557b6620f3ea3',
                    value: 462000000,
                },
                {
                    scriptHex: '76a914751e76e8199196d454941c45d1b3a323f1433bd688ac',
                    value: 294000000,
                },
                {
                    scriptHex: '5120e4d810fd50586274face62b8a807eb9719cef49c04177cc6b76a9a4251d5450e',
                    value: 504000000,
                },
                {
                    scriptHex: '512091b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
                    value: 630000000,
                },
                {
                    scriptHex: '00147dd65592d0ab2fe0d0257d571abf032cd9db93dc',
                    value: 378000000,
                },
                {
                    scriptHex: '512075169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
                    value: 672000000,
                },
                {
                    scriptHex: '51200f63ca2c7639b9bb4be0465cc0aa3ee78a0761ba5f5f7d6ff8eab340f09da561',
                    value: 546000000,
                },
                {
                    scriptHex: '5120053690babeabbb7850c32eead0acf8df990ced79f7a31e358fabf2658b4bc587',
                    value: 588000000,
                },
            ],
            txHex: '02000000097de20cbff686da83a54981d2b9bab3586f4ca7e48f57f5b55963115f3b334e9c010000000000000000d7b7cab57b1393ace2d064f4d4a2cb8af6def61273e127517d44759b6dafdd990000000000fffffffff8e1f583384333689228c5d28eac13366be082dc57441760d957275419a418420000000000fffffffff0689180aa63b30cb162a73c6d2a38b7eeda2a83ece74310fda0843ad604853b0100000000feffffff0c638ca38362001f5e128a01ae2b379288eb22cfaf903652b2ec1c88588f487a0000000000feffffff956149bdc66faa968eb2be2d2faa29718acbfe3941215893a2a3446d32acd05000000000000000000081efa267f1f0e46e054ecec01773de7c844721e010c2db5d5864a6a6b53e013a010000000000000000a690669c3c4a62507d93609810c6de3f99d1a6e311fe39dd23683d695c07bdee0000000000ffffffff727ab5f877438496f8613ca84002ff38e8292f7bd11f0a9b9b83ebd16779669e0100000000ffffffff0200ca9a3b000000001976a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac807840cb0000000020ac9a87f5594be208f8532db38cff670c450ed2fea8fcdefcc9a663f78bab962b0065cd1d',
            cases: [
                {
                    vin: 0,
                    typeHex: '03',
                    hash: '7e584883b084ace0469c6962a9a7d2a9060e1f3c218ab40d32c77651482122bc',
                },
                {
                    vin: 1,
                    typeHex: '83',
                    hash: '325a644af47e8a5a2591cda0ab0723978537318f10e6a63d4eed783b96a71a4d',
                },
                {
                    vin: 3,
                    typeHex: '01',
                    hash: '6ffd256e108685b41831385f57eebf2fca041bc6b5e607ea11b3e03d4cf9d9ba',
                },
                {
                    vin: 4,
                    typeHex: '00',
                    hash: '9f90136737540ccc18707e1fd398ad222a1a7e4dd65cbfd22dbe4660191efa58',
                },
                {
                    vin: 6,
                    typeHex: '02',
                    hash: '835c9ab6084ed9a8ae9b7cda21e0aa797aca3b76a54bd1e3c7db093f6c57e23f',
                },
                {
                    vin: 7,
                    typeHex: '82',
                    hash: 'df1cca638283c667084b8ffe6bf6e116cc5a53cf7ae1202c5fee45a9085f1ba5',
                },
                {
                    vin: 8,
                    typeHex: '81',
                    hash: '30319859ca79ea1b7a9782e9daebc46e4ca4ca2bc04c9c53b2ec87fa83a526bd',
                },
            ],
        },
    ],
    invalid: {
        addInput: [
            {
                exception: 'Expected property "0" of type Buffer\\(Length: 32\\), got Buffer\\(Length: 30\\)',
                hash: '0aed1366a73b6057ee7800d737bff1bdf8c448e98d86bc0998f2b009816d',
                index: 0,
            },
            {
                exception: 'Expected property "0" of type Buffer\\(Length: 32\\), got Buffer\\(Length: 34\\)',
                hash: '0aed1366a73b6057ee7800d737bff1bdf8c448e98d86bc0998f2b009816da9b0ffff',
                index: 0,
            },
        ],
        fromBuffer: [
            {
                exception: 'Transaction has unexpected data',
                hex: '0100000002f1fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe000000006b483045022100e661badd8d2cf1af27eb3b82e61b5d3f5d5512084591796ae31487f5b82df948022006df3c2a2cac79f68e4b179f4bbb8185a0bb3c4a2486d4405c59b2ba07a74c2101210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798fffffffff2fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe0100000083483045022100be54a46a44fb7e6bf4ebf348061d0dace7ddcbb92d4147ce181cf4789c7061f0022068ccab2a89a47fc29bb5074bca99ae846ab446eecf3c3aaeb238a13838783c78012102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee517a9147ccb85f0ab2d599bc17246c98babd5a20b1cdc7687ffffffff0250c30000000000001976a914c42e7ef92fdb603af844d064faad95db9bcdfd3d88acf04902000000000017a9147ccb85f0ab2d599bc17246c98babd5a20b1cdc768700000000ffffffff',
            },
            {
                exception: 'Transaction has superfluous witness data',
                hex: '0100000000010113ae35a2063ba413c3a1bb9b3820c76291e40e83bd3f23c8ff83333f0c64d623000000004a00483045022100e332e8367d5fee22c205ce1bf4e01e39f1a8decb3ba20d1336770cf38b8ee72d022076b5f83b3ee15390133b7ebf526ec189eb73cc6ee0a726f70b939bc51fa18d8001ffffffff0180969800000000001976a914b1ae3ceac136e4bdb733663e7a1e2f0961198a1788ac0000000000',
            },
        ],
    },
};
export default fixtures;
