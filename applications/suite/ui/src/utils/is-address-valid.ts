export const isAddressValid = (address: string): boolean => /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
