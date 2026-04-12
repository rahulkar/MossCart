import { prisma } from "./db.js";
import { products } from "./seed-data.js";

export async function seedCatalog() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Seeded", products.length, "products");
}
