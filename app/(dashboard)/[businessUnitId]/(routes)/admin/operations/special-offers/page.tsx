import React from 'react';
import { getAllSpecialOffers } from '@/lib/cms-actions/special-offer';
import SpecialOfferListPage from './components/special-offer-list-page';


const SpecialOffersPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const offers = await getAllSpecialOffers(businessUnitId);

  return <SpecialOfferListPage initialOffers={offers} />;
};

export default SpecialOffersPage;