import React from 'react';
import EventListPage from './components/events-list-page';
import { getAllEvents } from '@/lib/cms-actions/events-management';


const EventsPage: React.FC = async () => {
  const events = await getAllEvents();

  return <EventListPage initialEvents={events} />;
};

export default EventsPage;