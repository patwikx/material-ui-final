import React from 'react';
import { getAllSpecialOffers } from '@/lib/cms-actions/special-offer';
import SpecialOfferListPage from './components/special-offer-list-page';


const SpecialOffersPage: React.FC = async () => {
  const offers = await getAllSpecialOffers();

  return <SpecialOfferListPage initialOffers={offers} />;
};

export default SpecialOffersPage;