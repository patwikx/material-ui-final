import React from 'react';
import RoomTypeListPage from './components/room-types-list-page';
import { getRoomTypes } from '@/lib/actions/room-type-management';

const RoomTypesPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const roomTypes = await getRoomTypes(businessUnitId);

  return <RoomTypeListPage initialRoomTypes={roomTypes} />;
};

export default RoomTypesPage;