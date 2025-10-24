const fs = require('fs');
const path = require('path');
const db = require('../models');

/**
 * Seed categories into the services table when there are none.
 * It reads frontend `Explore.tsx` to extract category strings from the mock `content` array.
 */

async function extractCategoriesFromFrontend() {
  const explorePath = path.resolve(__dirname, '../../src/pages/Explore.tsx');
  if (!fs.existsSync(explorePath)) return [];
  const text = fs.readFileSync(explorePath, 'utf8');

  // crude regex to capture category: 'Some Category' occurrences within the content array
  const regex = /category:\s*'(.*?)'/g;
  const set = new Set();
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) set.add(m[1]);
  }
  return Array.from(set);
}

async function seed() {
  try {
    const categories = await extractCategoriesFromFrontend();
    if (!categories.length) {
      console.log('No categories found in frontend Explore.tsx to seed.');
      return;
    }

    console.log('Ensuring sample services exist for categories:', categories.join(', '));

    const created = [];
    const skipped = [];

    for (let idx = 0; idx < categories.length; idx++) {
      const cat = categories[idx];

      // Skip if any service already exists for this category (idempotent)
      const exists = await db.Service.findOne({ where: { category: cat } });
      if (exists) {
        skipped.push(cat);
        continue;
      }

      // Use a placeholder image service for seeded thumbnails so UI shows a preview.
      const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(cat)}/800/600`;

      const sample = {
        title: `${cat} Sample Service`,
        description: `Auto-seeded sample service for category ${cat}. Edit or remove this sample.`,
        category: cat,
        price: 9.99 + (idx % 5) * 5,
        thumbnail: placeholderUrl,
        creatorName: 'Seeder',
        metadata: {
          seeded: true,
          seededAt: new Date().toISOString(),
          note: 'Generated from frontend categories',
        },
      };

      try {
        await db.Service.create(sample);
        created.push(cat);
      } catch (innerErr) {
        console.warn(`Failed to create sample for category ${cat}:`, innerErr.message || innerErr);
      }
    }

    console.log(`Seeding complete. Created: ${created.length}, Skipped: ${skipped.length}`);
    if (created.length) console.log('Created categories:', created.join(', '));
    if (skipped.length) console.log('Skipped existing categories:', skipped.join(', '));
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

module.exports = seed;

if (require.main === module) {
  (async () => {
    await seed();
    process.exit(0);
  })();
}
