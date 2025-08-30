import "../globals.css";
import Header from '../../components/header';
import { CssBaseline } from '@mui/material';
import { getWebsiteConfiguration } from "@/lib/website-config";
import { getBusinessUnits } from "@/lib/actions/business-units";


export const metadata = {
  title: "Tropicana Worldwide Corp.",
  description: "Hotel Management & CMS for TWC",
};

export const viewport = {
  themeColor: '#0a0e13',
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use your existing server actions instead of inline Prisma queries
  const [websiteConfig, businessUnits] = await Promise.all([
    getWebsiteConfiguration(),
    getBusinessUnits(), // This already returns BusinessUnitData[] with proper caching
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