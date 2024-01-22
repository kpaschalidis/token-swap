import { BuidlerConfig } from "@nomiclabs/buidler/config";
import configBase from "./buidler.config";

const configV5: BuidlerConfig = {
  ...configBase,
  solc: {
    version: "0.5.15",
  },
  paths: {
    sources: "./contracts/5",
    artifacts: "./build",
  },
};

export default configV5;
