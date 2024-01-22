import * as dotenv from "dotenv";
import { ConfigurationDto } from "./configuration.dto";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const configuration = new ConfigurationDto();
Object.assign(configuration, { ...result.parsed });

export default configuration;
