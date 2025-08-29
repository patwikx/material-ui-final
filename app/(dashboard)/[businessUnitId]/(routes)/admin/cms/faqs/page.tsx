import React from 'react';
import { getAllFAQs } from '@/lib/actions/faq-management';
import FAQListPage from './components/faqs-list-page';


const FAQsPage: React.FC = async () => {
  const faqs = await getAllFAQs();

  return <FAQListPage initialFAQs={faqs} />;
};

export default FAQsPage;