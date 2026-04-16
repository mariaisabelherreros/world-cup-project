import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateCardPack = async (count: number = 5) => {
  const pack = [];

  for (let i = 0; i < count; i++) {
    // 1. Roll a random number between 0 and 100
    const roll = Math.random() * 100;
    let minRating = 0;
    let maxRating = 100;

    // 2. Determine the Rarity Tier based on your brackets
    if (roll <= 5) {
      // Legendary (5%)
      minRating = 85;
      maxRating = 100;
    } else if (roll <= 15) {
      // Gold (Next 10% -> 5 + 10 = 15)
      minRating = 75;
      maxRating = 84;
    } else if (roll <= 50) {
      // Silver (Next 35% -> 15 + 35 = 50)
      minRating = 65;
      maxRating = 74;
    } else {
      // Bronze (Remaining 50%)
      minRating = 0;
      maxRating = 64;
    }

    // 3. Get the total count of players in this rating bracket
    const availableCount = await prisma.card.count({
      where: {
        rating: { gte: minRating, lte: maxRating }
      }
    });

    // 4. Pick a random offset within that count
    if(availableCount > 0){
        const skip = Math.floor(Math.random() * availableCount);

        // 5. Fetch the random player
        const player = await prisma.card.findMany({
        where: {
            rating: { gte: minRating, lte: maxRating }
        },
        take: 1,
        skip: skip
        });

        pack.push(player[0]);
    }
  }
  
  return pack;
};