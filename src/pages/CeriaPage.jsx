import React, { useEffect, useState } from 'react';
import CeriaModule from '../modules/ceria/CeriaModule';
import { DataProvider } from '../modules/ceria/context/DataContext';
import PageTransition from '../components/PageTransition';
import CeriaLoader from '../modules/ceria/components/shared/CeriaLoader';

const CeriaPage = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Force a small delay to show the beautiful branded transition
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200);

    const originalTitle = document.title;
    document.title = "CERIA";
    
    return () => {
      clearTimeout(timer);
      document.title = originalTitle;
    };
  }, []);

  if (isInitialLoading) {
    return <CeriaLoader />;
  }

  return (
    <PageTransition>
      <DataProvider>
        <CeriaModule />
      </DataProvider>
    </PageTransition>
  );
};

export default CeriaPage;
