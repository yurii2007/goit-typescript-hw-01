'use client';

import { FC } from 'react';
import { StudentIntro } from '@/models/studentIntro';

export interface CardProps {
  studentIntro: StudentIntro;
}

export const Card: FC<CardProps> = ({ studentIntro }) => {
  return (
    <div className="p-4 w-[500px] border border-gray-700 rounded-lg m-2 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{studentIntro.name}</h2>
      </div>
      <p className="text-gray-400 mt-2">{studentIntro.message}</p>
    </div>
  );
};
