CREATE TYPE "UserPermission" AS ENUM ('MOVE_WORK_ITEMS');

ALTER TABLE "User"
ADD COLUMN "permissions" "UserPermission"[] NOT NULL DEFAULT ARRAY[]::"UserPermission"[];
