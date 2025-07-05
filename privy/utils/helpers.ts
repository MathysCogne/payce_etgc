/**
 * Returns bytes32 from an address
 * @param address the address to be convert to bytes32
 */
export function addressToBytes32(address: string): `0x${string}` {
  // "0x" + 24 zeros + Rest of the address string with leading "0x" trimmed
  const addressBytes =
    '0x' +
    '000000000000000000000000' +
    address.slice(2, address.length);
  return addressBytes as `0x${string}`;
} 