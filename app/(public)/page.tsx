// page.tsx
import React from 'react';
import { Box } from '@mui/material';
import Hero from '../../components/hero';
import Properties from '../../components/properties';
import Restaurants from '../../components/restaurants';
import Events from '../../components/events';
import SpecialOffers from '../../components/specialoffers';
import Testimonials from '../../components/testimonials';
import Maps from '../../components/maps';
import FAQ from '../../components/faqs';
import { getActiveHeroes } from '../../lib/actions/heroes'; // Changed from getFeaturedHero
import { getFeaturedBusinessUnits } from '../../lib/actions/properties';
import { getFeaturedRestaurants } from '../../lib/actions/restaurants';
import { getPublishedEventsLessRestrictive } from '../../lib/actions/events';
import { getFeaturedSpecialOffers } from '../../lib/actions/special-offers';
import { getFeaturedTestimonials } from '../../lib/actions/testimonials';

const Home: React.FC = async () => {
  // Fetch data on the server - changed to getActiveHeroes
  const [
    heroesData, // Changed from heroData
    propertiesData, 
    restaurantsData, 
    eventsData, 
    specialOffersData,
    testimonialsData
  ] = await Promise.all([
    getActiveHeroes(), // Changed from getFeaturedHero()
    getFeaturedBusinessUnits(),
    getFeaturedRestaurants(),
    getPublishedEventsLessRestrictive(),
    getFeaturedSpecialOffers(4),
    getFeaturedTestimonials(6),
    
  ]);

console.log('Events data from server:', eventsData); // Add this line
    console.log('Events count:', eventsData?.length); // Add this line

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, overflowX: 'hidden'}}>
        <Hero heroesData={heroesData} /> {/* Changed prop name */}
        <Properties properties={propertiesData} />
        <Restaurants restaurants={restaurantsData} />
        <Events events={eventsData} />
        <SpecialOffers offers={specialOffersData} />
        <Testimonials testimonials={testimonialsData} />
        <Maps />
        <FAQ />
      </Box>
    </Box>
  );
};

export default Home;