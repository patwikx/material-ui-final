// page.tsx
import React from 'react';
import { Box } from '@mui/material';
//import Header from '../../components/header';
import Hero from '../../components/hero';
import Properties from '../../components/properties';
import Restaurants from '../../components/restaurants';
import Events from '../../components/events';
import SpecialOffers from '../../components/specialoffers';
import Testimonials from '../../components/testimonials';
import Maps from '../../components/maps';
import FAQ from '../../components/faqs';
import { getFeaturedHero } from '../../lib/actions/heroes';
import { getFeaturedBusinessUnits } from '../../lib/actions/properties';
import { getFeaturedRestaurants } from '../../lib/actions/restaurants';
import { getFeaturedEvents } from '../../lib/actions/events';
import { getFeaturedSpecialOffers } from '../../lib/actions/special-offers';
import { getFeaturedTestimonials } from '../../lib/actions/testimonials'; // Add this import

const Home: React.FC = async () => {
  // Fetch data on the server - add testimonials to the Promise.all
  const [
    heroData, 
    propertiesData, 
    restaurantsData, 
    eventsData, 
    specialOffersData,
    testimonialsData
  ] = await Promise.all([
    getFeaturedHero('homepage'),
    getFeaturedBusinessUnits(),
    getFeaturedRestaurants(),
    getFeaturedEvents(6), // Limit to 6 featured events for homepage
    getFeaturedSpecialOffers(4), // Limit to 4 featured offers for homepage
    getFeaturedTestimonials(6), // Limit to 6 featured testimonials for homepage
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, overflowX: 'hidden'}}>
        <Hero heroData={heroData} />
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