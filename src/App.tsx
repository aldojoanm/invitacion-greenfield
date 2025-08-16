import { useState } from 'react';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import Location from './components/Location';

import './App.css';
import ExperienceWheel from './components/ExperienceWheel';

export default function App() {
  const [stage, setStage] = useState<'hero' | 'welcome'>('hero');

  const handleEnter = () => {
    setStage('welcome');
  };

  return (
    <>
      {stage === 'hero' ? (
        <Hero onEnter={handleEnter} />
      ) : (
        <>
          <ExperienceWheel />
          <Location />
          <Countdown targetDate="2025-10-02T08:00:00" />
        </>
      )}
    </>
  );
}
