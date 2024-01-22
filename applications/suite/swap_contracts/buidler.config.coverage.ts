import { BuidlerConfig } from "@nomiclabs/buidler/config";
import configBase from "./buidler.config";

const configCoverageV5: BuidlerConfig = {
  ...configBase,
  solc: {
    version: "0.5.15",
  },
  paths: {
    sources: "./contracts/5",
    artifacts: "./artifacts",
  },
};

export default configCoverageV5;
