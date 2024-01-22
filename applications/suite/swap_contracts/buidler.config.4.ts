import { BuidlerConfig } from "@nomiclabs/buidler/config";
import configBase from "./buidler.config";

const configV5: BuidlerConfig = {
  ...configBase,
  solc: {
    version: "0.4.13"
  },
  paths: {
    sources: "./contracts/4",
    artifacts: "./build"
  }
};

export default configV5;
