import type { GetServerSideProps } from 'next';
import { type NextPage } from 'next';
import { useState } from 'react';
import { Tracker } from '../components/Tracker';
import type { Configuration } from '../components/TrackerConfiguration';
import { CONFIGURATION_KEY, TrackerConfiguration } from '../components/TrackerConfiguration';

export const getServerSideProps: GetServerSideProps = ({ req }) => {
  return Promise.resolve({
    props: {
      savedConfiguration: JSON.parse(req.cookies[CONFIGURATION_KEY] || 'null') as Configuration,
    },
  });
};

const Home: NextPage<{ savedConfiguration: Configuration | null }> = ({ savedConfiguration }) => {
  const [isConfigured, setIsConfigured] = useState(!!savedConfiguration);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold text-white sm:text-[4rem]">Track yor paid workouts</h1>
          {isConfigured ? (
            <Tracker savedConfiguration={savedConfiguration} />
          ) : (
            <TrackerConfiguration
              savedConfiguration={savedConfiguration}
              onConfigurationSave={() => setIsConfigured(true)}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
