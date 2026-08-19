import { LocalStorageAdapter } from "./local.adapter.js";
import { STORAGE_TYPE } from "../../env.js";
import { S3StorageAdapter } from "./cloud.adapter.js";

export const storage = STORAGE_TYPE == "s3" ? new S3StorageAdapter() : new LocalStorageAdapter();
