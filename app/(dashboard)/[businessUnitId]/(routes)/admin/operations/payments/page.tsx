import React from 'react';
import PaymentListPage from './components/payments-list-page';
import { getAllPayments } from '@/lib/actions/payment-management';


const PaymentsPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const payments = await getAllPayments(businessUnitId);

  return <PaymentListPage initialPayments={payments} />;
};

export default PaymentsPage;