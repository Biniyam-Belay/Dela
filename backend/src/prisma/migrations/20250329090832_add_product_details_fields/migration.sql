-- AlterTable
ALTER TABLE "products" ADD COLUMN     "originalPrice" DECIMAL(10,2),
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER DEFAULT 0,
ADD COLUMN     "sellerLocation" TEXT,
ADD COLUMN     "sellerName" TEXT,
ADD COLUMN     "unitsSold" INTEGER DEFAULT 0;
