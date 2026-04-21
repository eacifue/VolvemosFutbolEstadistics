import React from 'react';
import PlayerCard from './PlayerCard';

const mockData = [
  {
    name: 'Lionel Messi',
    photo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=500&q=80',
    goals: 30,
    assists: 20,
    matches: 25,
    rank: 1,
  },
  {
    name: 'Cristiano Ronaldo',
    photo: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=500&q=80',
    goals: 25,
    assists: 15,
    matches: 30,
    rank: 2,
  },
  {
    name: 'Kylian Mbappé',
    photo: null,
    goals: 20,
    assists: 10,
    matches: 22,
    rank: 3,
  },
];

const PlayerCardDemo = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-center text-3xl font-black uppercase tracking-[0.15em] text-white sm:text-4xl">
          Volvamos Futbol - Player Cards
        </h1>
        <p className="mb-8 text-center text-sm font-medium text-slate-300 sm:text-base">
          Estilo coleccionable premium inspirado en videojuegos de futbol.
        </p>

        <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockData.map((player) => (
            <PlayerCard
              key={player.name}
              name={player.name}
              photo={player.photo}
              goals={player.goals}
              assists={player.assists}
              matches={player.matches}
              rank={player.rank}
            />
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default PlayerCardDemo;