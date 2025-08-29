import React from 'react';
import { getAllBusinessUnits } from '@/lib/actions/business-management';
import BusinessUnitListPage from './components/property-list-page';

const PropertiesPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params;
  const businessUnits = await getAllBusinessUnits(businessUnitId);

  return <BusinessUnitListPage initialBusinessUnits={businessUnits} />;
};

export default PropertiesPage;