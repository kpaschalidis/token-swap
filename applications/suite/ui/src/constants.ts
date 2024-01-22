export const V1_TOKEN_NAME = "TT1 (Token V1)";
export const V2_TOKEN_NAME = "TT2 (Token V2)";
export const MAX_ENTRIES = 100; //contract limitation of 3000 addresses per transaction
export const SUPPORTED_NETWORK_IDS = [1, 3, 4];
export const NUMBER_OF_CONFIRMATIONS_ETH = [6, 3];
export const SUPPORTED_NETWORK_NAMES = ["Main", "Ropsten", "Rinkeby"];
export const REQUIRED_CONFIRMATIONS = 1;
export const V1_TOTAL_SUPPLY = "1380392157".concat(String(10 ** 18)); // @TODO review
console.log(`V1_TOTAL_SUPPLY: ${V1_TOTAL_SUPPLY}`);

// steps
// export const APPROVE_CONTRACT_STEP_INDEX = 3;
export const SEND_TOKENS_STEP_INDEX = 3;
export const COMPLETE_PROCESS_STEP = 4;

// LOCAL_STORAGE
export const SWAP_UPGRADE_STATE = "SWAP_UPGRADE_STATE";
