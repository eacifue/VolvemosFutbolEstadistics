// Iconos del sistema → Phosphor (regular inactivo, fill activo), equivalencias de docs/sistema-de-diseno.md.
import React from 'react';
import {
  ArrowCounterClockwise, ArrowDown, ArrowUp, ArrowsDownUp, Bell, CalendarBlank, CaretLeft, CaretRight, ChartBar, Check, Clock,
  DeviceMobile, DotsThree, DownloadSimple, DropSlash, Export, Fire, Info, LinkSimple, Lock, MagnifyingGlass, MapPin, Minus, Money, Moon,
  PencilSimple, Plus, Scales, ShieldCheck, Shield, SoccerBall, Sparkle, Star, Sun, Timer, Trash, UserSwitch, Users, WifiSlash, X, House,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';

const MAP = {
  home: House,
  matches: CalendarBlank,
  ranking: ChartBar,
  players: Users,
  admin: ShieldCheck,
  share: Export,
  plus: Plus,
  minus: Minus,
  undo: ArrowCounterClockwise,
  check: Check,
  close: X,
  search: MagnifyingGlass,
  chevron: CaretRight,
  back: CaretLeft,
  clock: Clock,
  pin: MapPin,
  fire: Fire,
  drought: DropSlash,
  link: LinkSimple,
  offline: WifiSlash,
  lock: Lock,
  edit: PencilSimple,
  trash: Trash,
  scale: Scales,
  star: Star,
  up: ArrowUp,
  down: ArrowDown,
  sort: ArrowsDownUp,
  whistle: SoccerBall,
  shield: Shield,
  more: DotsThree,
  timer: Timer,
  sun: Sun,
  moon: Moon,
  download: DownloadSimple,
  bell: Bell,
  sparkle: Sparkle,
  money: Money,
  info: Info,
  phone: DeviceMobile,
  swap: UserSwitch,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof MAP;

export interface IconProps {
  name: IconName;
  size?: number;
  title?: string;
  fill?: boolean;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, title, fill = false, className }) => {
  const Cmp = MAP[name] ?? DotsThree;
  return (
    <Cmp
      className={['vf-icon', className].filter(Boolean).join(' ')}
      size={size}
      weight={fill ? 'fill' : 'regular'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? 'img' : undefined}
    />
  );
};
