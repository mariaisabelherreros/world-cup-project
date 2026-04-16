import { PrismaClient } from '@prisma/client';
import { generateCardPack } from './generateCardPack.ts';

const prisma = new PrismaClient();

export async function openCardPack(userId: number, packSize: number = 5, packCost: number = 0) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get user info
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { currency: true }
    });

    // 2. Check if the person exists
    if (!user) {
    throw new Error("User account not found.");
    }

    // 3. Check the if user has enough currency
    if (user.currency < packCost) {
    throw new Error(`You need ${packCost} currency, but you only have ${user.currency}.`);
    }

    // 2. Deduct the currency
    await tx.user.update({
      where: { id: userId },
      data: { currency: { decrement: packCost } }
    });

    // 3. Generate the cards for the pack
    const newCards = await generateCardPack(packSize); 
    //const newCards = [{ id: 1 }, { id: 2 }, { id: 5 }]; // Dummy data for testing

    // 4. Add cards to Inventory (upsert to handle duplicates)
    const inventoryUpdates = newCards.map((card) => {
      return tx.inventory.upsert({
        where: {
          userId_cardId: {
            userId: userId,
            cardId: card.id,
          },
        },
        update: { quantity: { increment: 1 } },
        create: {
          userId: userId,
          cardId: card.id,
          quantity: 1,
        },
      });
    });

    await Promise.all(inventoryUpdates);

    return { message: "Pack opened successfully!", cards: newCards };
  });
}