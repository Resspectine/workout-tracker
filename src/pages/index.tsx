import { type NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { Tracker } from '../components/Tracker';
import type { Configuration } from '../components/TrackerConfiguration';
import { CONFIGURATION_KEY } from '../components/TrackerConfiguration';
import { TrackerConfiguration } from '../components/TrackerConfiguration';

const Home: NextPage = () => {
  const [localStorageConfiguration] = useLocalStorage<Configuration | null>(CONFIGURATION_KEY, null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(!!localStorageConfiguration);
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold text-white sm:text-[4rem]">Track yor paid workouts</h1>
          {isConfigured ? <Tracker /> : <TrackerConfiguration onConfigurationSave={() => setIsConfigured(true)} />}
        </div>
      </main>
    </>
  );
};

export default Home;
