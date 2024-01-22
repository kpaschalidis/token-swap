import * as colors from "ansi-colors";

export const logResult = (
  type: string,
  name: string,
  address: string,
  txHash: string | undefined
) => {
  console.log(`\
  ${colors.white.bgBlack(type)} ${colors.black.bgYellow(
    name
  )} contract at ${colors.green.bgBlack(address)} with hash ${txHash}`);
};
