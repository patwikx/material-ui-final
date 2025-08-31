import React from 'react';

import { getAllRoomRates } from '@/lib/actions/room-rates-management';
import RoomRateListPage from './components/room-rates-list-page';

const RoomRatesPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const roomRates = await getAllRoomRates(businessUnitId);

  return <RoomRateListPage initialRoomRates={roomRates} />;
};

export default RoomRatesPage;