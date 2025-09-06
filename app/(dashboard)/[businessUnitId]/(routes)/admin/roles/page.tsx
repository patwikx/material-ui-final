import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllRoles } from '@/lib/actions/roles-management';
import RoleListPage from './components/roles-list-page';


const RolesPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Check if user is admin
  const isAdmin = session.user.assignments.some(
    assignment => assignment.role.name === 'SUPER_ADMIN'
  );

  if (!isAdmin) {
    redirect(`/${businessUnitId}`);
  }

  const roles = await getAllRoles();

  return <RoleListPage initialRoles={roles} businessUnitId={businessUnitId} />;
};

export default RolesPage;