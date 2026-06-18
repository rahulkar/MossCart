import { products } from "../seed-data.js";
import { randomUUID } from "node:crypto";

function sqlString(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function sqlJson(value) {
  return value == null ? "NULL" : sqlString(JSON.stringify(value));
}

const lines = [
  'DELETE FROM "OrderItem";',
  'DELETE FROM "Order";',
  'DELETE FROM "CartItem";',
  'DELETE FROM "Product";',
];

for (const p of products) {
  const id = randomUUID();
  lines.push(
    `INSERT INTO Product (id, name, subtitle, sku, description, priceCents, imageUrl, category, ecoScore, stock, highlights, specs) VALUES (` +
      [
        sqlString(id),
        sqlString(p.name),
        sqlString(p.subtitle ?? ""),
        sqlString(p.sku ?? ""),
        sqlString(p.description),
        p.priceCents,
        sqlString(p.imageUrl ?? ""),
        sqlString(p.category),
        p.ecoScore,
        p.stock,
        sqlJson(p.highlights),
        sqlJson(p.specs),
      ].join(", ") +
      `);`
  );
}

console.log(lines.join("\n"));
