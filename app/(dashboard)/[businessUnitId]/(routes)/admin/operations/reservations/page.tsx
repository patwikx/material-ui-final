import React from 'react';
import { getAllReservations } from '@/lib/actions/reservations';
import ReservationListPage from './components/reservation-list-page';

const ReservationsPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const reservations = await getAllReservations(businessUnitId);

  return <ReservationListPage initialReservations={reservations} />;
};

export default ReservationsPage;