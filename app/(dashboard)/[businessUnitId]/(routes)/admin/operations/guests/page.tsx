import React from 'react';
import GuestListPage from './components/guest-list-page';
import { getAllGuests } from '@/lib/actions/guest-management';


const GuestsPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const guests = await getAllGuests(businessUnitId);

  return <GuestListPage initialGuests={guests} />;
};

export default GuestsPage;