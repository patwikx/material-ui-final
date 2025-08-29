import React from 'react';
import TestimonialListPage from './components/testimonial-list-page';
import { getAllTestimonials } from '@/lib/actions/testimonial-actions';


const TestimonialsPage: React.FC = async () => {
  const testimonials = await getAllTestimonials();

  return <TestimonialListPage initialTestimonials={testimonials} />;
};

export default TestimonialsPage;