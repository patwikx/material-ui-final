import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import type { BusinessUnitItem } from '@/types/business-unit-types';
import { prisma } from '@/lib/prisma';
import "../globals.css";
import { Sidebar } from '@/components/new-sidebar';
import { Toaster } from 'sonner';
import { BusinessUnitProvider } from '@/context/business-unit-context';

export const metadata = {
  title: "Tropicana Worldwide Corp.",
  description: "Hotel Management & CMS for TWC",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const businessUnitId = headersList.get("x-business-unit-id");
  const session = await auth();

  // Redirect to sign-in if there's no session or user
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // --- REMOVED ---
  // The broken "Force re-fetch" block has been removed.
  // Your auth.ts jwt/session callbacks are the source of truth for session data.

  // If no business unit is in the URL, redirect to the user's first assigned unit
  if (!businessUnitId) {
    const defaultUnitId = session.user.assignments[0]?.businessUnitId;
    redirect(defaultUnitId ? `/${defaultUnitId}` : "/select-unit");
  }

  // --- PERMISSION CHECKS UPDATED FOR NEW SCHEMA ---

  // A user is an admin if they have the 'SUPER_ADMIN' role in ANY of their assignments.
  const isAdmin = session.user.assignments.some(
    (assignment) => assignment.role.name === 'SUPER_ADMIN'
  );

  // A user is authorized if their assignments include the current business unit ID.
  const isAuthorizedForUnit = session.user.assignments.some(
    (assignment) => assignment.businessUnitId === businessUnitId,
  );

  // If the user is neither an admin nor authorized for the requested unit, redirect them.
  if (!isAdmin && !isAuthorizedForUnit) {
    const defaultUnitId = session.user.assignments[0]?.businessUnitId;
    redirect(defaultUnitId ? `/${defaultUnitId}` : "/select-unit");
  }

  let businessUnits: BusinessUnitItem[] = [];

  // If the user is an admin, fetch all business units from the database.
  if (isAdmin) {
    businessUnits = await prisma.businessUnit.findMany({
      orderBy: { displayName: "asc" }, // Order by the user-friendly name
      select: {
        id: true,
        name: true, // Keep name for internal logic if needed
        displayName: true,
      },
    });
  } else {
    // Otherwise, just list the business units they are assigned to from the session.
    businessUnits = session.user.assignments.map((assignment) => ({
      id: assignment.businessUnit.id,
      name: assignment.businessUnit.name,
      displayName: assignment.businessUnit.displayName, // Add displayName mapping
    }));
  }

  return (
    <>
      <div className="flex h-screen">
        <div className="hidden md:flex md:w-64 md:flex-col md:flex-shrink-0 md:border-r">
          <Sidebar businessUnitId={businessUnitId} businessUnits={businessUnits} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <BusinessUnitProvider businessUnitId={businessUnitId}>
              {children}
            </BusinessUnitProvider>
            <Toaster />
          </main>
        </div>
      </div>
    </>
  )
}