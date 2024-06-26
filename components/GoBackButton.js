import React from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';

const GoBackButton = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <div className="fixed-bottom mt-4">
      <Button onClick={goBack} className="bg-black m-3 align-right text-white font-bold py-2 px-4 rounded cursor-pointer">
        Powrót
      </Button>
    </div>
  );
};

export default GoBackButton;
