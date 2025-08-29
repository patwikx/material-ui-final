
import { prisma } from '@/lib/prisma';
import "../globals.css";
import Header from '../../components/header';
import { CssBaseline } from '@mui/material';
import { getWebsiteConfiguration } from '@/lib/website-config';

export const metadata = {
  title: "Tropicana Worldwide Corp.",
  description: "Hotel Management & CMS for TWC",
};

export const viewport = {
  themeColor: '#0a0e13', // You can set a dark theme color here
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FIX: The auth and redirection logic is for the admin dashboard. 
  // A public layout does not need this and should not have a businessUnitId in its URL.
  // The correct layout.tsx for a public route should be simpler.
  
  const [websiteConfig, businessUnits] = await Promise.all([
    getWebsiteConfiguration(),
    prisma.businessUnit.findMany({
      where: {
        isActive: true,
        isPublished: true,
      },
      // FIX: Selected all the necessary fields
      select: {
        id: true,
        name: true,
        displayName: true,
        slug: true,
        address: true,
        city: true,
        state: true,
        country: true,
        description: true,
        shortDescription: true,
        propertyType: true,
        latitude: true,
        longitude: true,
        phone: true,
        email: true,
        website: true,
        isActive: true,
        isPublished: true,
        isFeatured: true,
        sortOrder: true,
        primaryColor: true,
        secondaryColor: true,
        logo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rooms: true,
            restaurants: {
              where: {
                isActive: true,
              },
            },
            specialOffers: {
              where: {
                status: 'ACTIVE',
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            isPrimary: true,
            image: {
              select: {
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                largeUrl: true,
                altText: true,
                title: true,
                description: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
      ],
    }),
  ]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0e13', color: '#e2e8f0' }}>
        <CssBaseline />
        <Header businessUnits={businessUnits} websiteConfig={websiteConfig} />
        <main style={{ paddingTop: '70px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}