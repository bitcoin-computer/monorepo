const fixtures = {
    valid: [
        {
            dec: 0n,
            hex: '0000000000000000',
        },
        {
            dec: 1n,
            hex: '0100000000000000',
        },
        {
            dec: 252n,
            hex: 'fc00000000000000',
        },
        {
            dec: 253n,
            hex: 'fd00000000000000',
        },
        {
            dec: 254n,
            hex: 'fe00000000000000',
        },
        {
            dec: 255n,
            hex: 'ff00000000000000',
        },
        {
            dec: 65534n,
            hex: 'feff000000000000',
        },
        {
            dec: 65535n,
            hex: 'ffff000000000000',
        },
        {
            dec: 65536n,
            hex: '0000010000000000',
        },
        {
            dec: 65537n,
            hex: '0100010000000000',
        },
        {
            dec: 4294967295n,
            hex: 'ffffffff00000000',
        },
        {
            dec: 4294967296n,
            hex: '0000000001000000',
        },
        {
            dec: 4294967297n,
            hex: '0100000001000000',
        },
        {
            dec: 9007199254740991n,
            hex: 'ffffffffffff1f00',
        },
        {
            // n === 2^53
            dec: 9007199254740992n,
            hex: '0000000000002000',
        },
        {
            // n > 2^53
            dec: 9007199254740993n,
            hex: '0100000000002000',
        },
    ],
    invalid: {
        writeUInt64LE: [
            {
                description: '0 < n < 1',
                exception: 'RangeError: The number 0.1 cannot be converted to a BigInt because it is not an integer',
                hex: '',
                dec: 0.1,
            },
            {
                description: 'value > (2^64)-1',
                exception: 'RangeError: value out of range',
                hex: '',
                dec: BigInt(0x1ffffffffffffffff),
            },
        ],
    },
};
export default fixtures;
