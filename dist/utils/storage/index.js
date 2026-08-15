import { LocalStorageAdapter } from "./local.adapter";
import { STORAGE_TYPE } from "../../env";
import { S3StorageAdapter } from "./cloud.adapter";
export const storage = STORAGE_TYPE == "s3" ? new LocalStorageAdapter() : new S3StorageAdapter();
