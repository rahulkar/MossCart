import { beforeEach } from "vitest";
import { prisma } from "../db.js";

beforeEach(async () => {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
  ]);
});
