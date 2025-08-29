import React from 'react';
import HeroListPage from './components/hero-list-page';
import { getAllHeroes } from '@/lib/cms-actions/hero-management';


const HeroPage: React.FC = async () => {
  const heroes = await getAllHeroes();

  return <HeroListPage initialHeroes={heroes} />;
};

export default HeroPage;