import React from 'react';
import { getAllRestaurants } from '@/lib/actions/resto-management';
import RestaurantListPage from './components/restaurants-list-page';

const RestaurantsPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const restaurants = await getAllRestaurants(businessUnitId);

  return <RestaurantListPage initialRestaurants={restaurants} />;
};

export default RestaurantsPage;