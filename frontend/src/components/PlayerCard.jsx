import React from 'react';
import PropTypes from 'prop-types';

export const calculateEffectiveness = (goals, assists, matches) => {
  if (!matches || matches <= 0) return 0;
  return Math.round(((goals + assists) / matches) * 100);
};

const PlayerCard = ({ name, photo, goals, assists, matches, rank }) => {
  const effectiveness = calculateEffectiveness(goals, assists, matches);
  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'PL';

  return (
    <article className="group relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-700 p-4 text-white shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_22px_45px_-15px_rgba(0,0,0,0.75)]">
      <div className="pointer-events-none absolute -left-12 -top-14 h-36 w-36 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-6 h-24 w-24 rounded-full bg-cyan-300/30 blur-2xl" />

      <header className="relative mb-4 flex flex-col items-center">
        {rank && (
          <span className="absolute -right-1 -top-1 rounded-full border border-yellow-200/60 bg-gradient-to-r from-yellow-300 to-amber-500 px-3 py-1 text-xs font-extrabold text-slate-900 shadow-lg">
            #{rank}
          </span>
        )}

        <div className="mb-3 h-28 w-28 overflow-hidden rounded-full border-4 border-white/50 bg-slate-800 shadow-lg ring-4 ring-yellow-300/30">
          {photo ? (
            <img
              src={photo}
              alt={`Foto de ${name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-3xl font-black text-white/90">
              {initials}
            </div>
          )}
        </div>

        <h2 className="text-center text-xl font-black uppercase tracking-wide text-white">
          {name}
        </h2>
        <p className="mt-1 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tracking-wide">
          Rendimiento {effectiveness}%
        </p>
      </header>

      <section className="relative grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">⚽ Goles</p>
          <p className="mt-1 text-2xl font-extrabold">{goals}</p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">🎯 Asistencias</p>
          <p className="mt-1 text-2xl font-extrabold">{assists}</p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">🏃 Partidos</p>
          <p className="mt-1 text-2xl font-extrabold">{matches}</p>
        </div>

        <div className="rounded-xl border border-white/20 bg-black/20 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">📊 Efectividad</p>
          <p className="mt-1 text-2xl font-extrabold">{effectiveness}%</p>
        </div>
      </section>

      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
      </div>
    </article>
  );
};

PlayerCard.propTypes = {
  name: PropTypes.string.isRequired,
  photo: PropTypes.string,
  goals: PropTypes.number.isRequired,
  assists: PropTypes.number.isRequired,
  matches: PropTypes.number.isRequired,
  rank: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PlayerCard.defaultProps = {
  photo: null,
  rank: null,
};

export default PlayerCard;