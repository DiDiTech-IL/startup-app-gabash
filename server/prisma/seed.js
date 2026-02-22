const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rewards = [
  { name: "משולש פיצה", cost: 40, icon: "🍕", color: "bg-orange-100 text-orange-600" },
  { name: "כרטיס לקולנוע", cost: 100, icon: "🎬", color: "bg-purple-100 text-purple-600" },
  { name: "שובר לגלידה", cost: 80, icon: "🍦", color: "bg-pink-100 text-pink-600" },
  { name: "בונוס 5 נק׳ במבחן", cost: 500, icon: "💯", color: "bg-blue-100 text-blue-600" },
];

async function main() {
  console.log("🌱 Seeding catalog data...");

  for (const reward of rewards) {
    const existing = await prisma.reward.findFirst({ where: { name: reward.name } });

    if (existing) {
      await prisma.reward.update({
        where: { id: existing.id },
        data: reward,
      });
    } else {
      await prisma.reward.create({ data: reward });
    }
  }

  console.log(`✅ Upserted ${rewards.length} rewards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
