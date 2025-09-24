/*
  Warnings:

  - Made the column `user_id` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `street` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip_code` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order_id` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_id` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order_id` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `method` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_order_id_fkey";

-- AlterTable
ALTER TABLE "public"."addresses" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zip_code" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."order_items" ALTER COLUMN "order_id" SET NOT NULL,
ALTER COLUMN "product_id" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "address_id" INTEGER,
ADD COLUMN     "shipping_cost" DECIMAL(10,2),
ADD COLUMN     "shipping_service" TEXT,
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "order_id" SET NOT NULL,
ALTER COLUMN "method" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "stock" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
