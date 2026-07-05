import { PrismaClient, TourDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const tours = [
  {
    title: 'Black Forest Weekend',
    slug: 'black-forest-weekend',
    summary: 'A relaxed hiking weekend through forest trails, viewpoints, and small villages.',
    description:
      'Explore the Black Forest with a small group, local guide support, scenic routes, and enough free time to enjoy regional food and quiet mountain views.',
    price: '349.00',
    duration: 3,
    maxGroupSize: 12,
    difficulty: TourDifficulty.EASY,
    ratingsAverage: '4.70',
    ratingsQuantity: 18,
    imageCover: 'black-forest-cover.jpg',
    images: ['black-forest-1.jpg', 'black-forest-2.jpg'],
    startDates: [new Date('2026-08-14T09:00:00.000Z'), new Date('2026-09-18T09:00:00.000Z')],
  },
  {
    title: 'Alpine Explorer',
    slug: 'alpine-explorer',
    summary: 'A guided mountain tour for active travelers who want crisp air and big views.',
    description:
      'Spend five days in the Bavarian Alps with planned routes, mountain huts, and a practical balance of challenge, safety, and recovery.',
    price: '899.00',
    duration: 5,
    maxGroupSize: 10,
    difficulty: TourDifficulty.MEDIUM,
    ratingsAverage: '4.90',
    ratingsQuantity: 27,
    imageCover: 'alpine-explorer-cover.jpg',
    images: ['alpine-explorer-1.jpg', 'alpine-explorer-2.jpg'],
    startDates: [new Date('2026-07-24T08:00:00.000Z'), new Date('2026-08-21T08:00:00.000Z')],
  },
  {
    title: 'Baltic Coast Escape',
    slug: 'baltic-coast-escape',
    summary: 'Sea air, cycling routes, coastal towns, and calm evenings near the water.',
    description:
      'A four-day coastal trip focused on accessible cycling, fresh air, and relaxed exploration of northern Germany.',
    price: '529.00',
    duration: 4,
    maxGroupSize: 14,
    difficulty: TourDifficulty.EASY,
    ratingsAverage: '4.50',
    ratingsQuantity: 12,
    imageCover: 'baltic-coast-cover.jpg',
    images: ['baltic-coast-1.jpg', 'baltic-coast-2.jpg'],
    startDates: [new Date('2026-06-12T09:00:00.000Z'), new Date('2026-09-04T09:00:00.000Z')],
  },
];

async function main(): Promise<void> {
  for (const tour of tours) {
    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tour,
      create: tour,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
