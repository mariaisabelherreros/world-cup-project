import { generateCardPack } from '../src/generateCardPack';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  //Grab the number of cards from the command line, or default to 5
  const count = parseInt(process.argv[2]) || 5;

  try {
    console.log(`---Generating Card Pack (${count} cards)---`);
    
    const pack = await generateCardPack(count);

    if (pack.length === 0) {
      console.log("No cards found!");
    } else {
      pack.forEach((card, index) => {
        console.log(`${index + 1}. [${card.rating}] ${card.short_name} - ${card.nationality}`);
      });
    }

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    //Close the database connection
    await prisma.$disconnect();
    console.log("---Test Complete---");
  }
}

runTest();