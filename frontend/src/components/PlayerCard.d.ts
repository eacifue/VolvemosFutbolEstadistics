import { FC } from 'react';

export interface PlayerCardProps {
	name: string;
	photo?: string | null;
	goals: number;
	assists: number;
	matches: number;
	rank?: number | string | null;
}

export function calculateEffectiveness(
	goals: number,
	assists: number,
	matches: number
): number;

declare const PlayerCard: FC<PlayerCardProps>;

export default PlayerCard;
