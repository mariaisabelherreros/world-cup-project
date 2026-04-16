import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
 
  const csvPath = path.join(process.cwd(), 'FC26_20250921.csv');
  
  console.log(`Checking for CSV at: ${csvPath}`);
  
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, { 
        columns: true, 
        skip_empty_lines: true
    });

  console.log(`Cleaning old cards and importing ${records.length} new players...`);

  // Clear tables
  await prisma.inventory.deleteMany();
  await prisma.card.deleteMany({});

  // Map the CSV rows to database
  const cardData = records.map((row: any) => ({
    short_name: row.short_name,
    long_name: row.long_name,
    rating: parseInt(row.overall) || 0,
    nationality: row.nationality_name,
    positions: String(row.player_positions || ""),
    age: parseInt(row.age) || 0,
    height_cm: parseInt(row.height_cm) || 0,
    weight_kg: parseInt(row.weight_kg) || 0,
    foot: row.preferred_foot,
    pace: parseInt(row.pace) || 0,
    shooting: parseInt(row.shooting) || 0,
    passing: parseInt(row.passing) || 0,
    dribbling: parseInt(row.dribbling) || 0,
    defending: parseInt(row.defending) || 0,
    physical: parseInt(row.physic) || 0,
    playerImageURL: String(row.player_face_url),
    setCode: "WC2026",
    collectorNumber: row.player_id.toString()
  }));

  //Import
  await prisma.card.createMany({
    data: cardData,
    skipDuplicates: true,
  });

  console.log("Card List updated!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });