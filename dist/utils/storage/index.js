import { LocalStorageAdapter } from "./local.adapter.js";
import { STORAGE_TYPE } from "../../env.js";
import { S3StorageAdapter } from "./cloud.adapter.js";
console.log(STORAGE_TYPE);
export const storage = STORAGE_TYPE == "s3" ? new LocalStorageAdapter() : new S3StorageAdapter();
