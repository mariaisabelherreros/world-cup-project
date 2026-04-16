import { openCardPack } from '../src/openCardPack';

// This lets you pass arguments like: npx tsx tests/openPackTest.ts [userId] [cost]
const userId = Number(process.argv[2]) || 1; 
const size = Number(process.argv[3]) || 5;
const cost = Number(process.argv[4]) || 0;

async function run() {
  console.log(`Testing openCardPack for User ID: ${userId}, Size: ${size} Cost: ${cost}`);
  
  try {
    const result = await openCardPack(userId, size, cost);
    
    console.log("SUCCESS!");
    console.log("-------------------");
    console.log(result.message);
    console.log("Cards Pulled:");
    console.table(result.cards);
    
} catch (error) {
    console.error("TEST FAILED");
    if (error instanceof Error) {
      console.error("Reason:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
  } finally {
    process.exit();
  }
}

run();