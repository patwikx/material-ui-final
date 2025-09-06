import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/actions/user-management';
import UserListPage from './components/users-list-page';


const UsersPage = async ({ params }: { params: { businessUnitId: string } }) => {
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

  const users = await getAllUsers();

  return <UserListPage initialUsers={users} businessUnitId={businessUnitId} />;
};

export default UsersPage;