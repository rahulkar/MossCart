import { PrismaClient } from "@prisma/client";
import { products } from "../src/seed-data.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Seeded", products.length, "products");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
