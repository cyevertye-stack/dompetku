'use client';

import React from 'react';
import {
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  User,
  MoreHorizontal,
  Coffee,
  Home,
  Plane,
  Book,
  Smartphone,
  DollarSign,
  Gift,
  Smile,
  Shield,
  Briefcase,
  Wrench,
  Tag,
  LucideIcon,
} from 'lucide-react';

export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  User,
  MoreHorizontal,
  Coffee,
  Home,
  Plane,
  Book,
  Smartphone,
  DollarSign,
  Gift,
  Smile,
  Shield,
  Briefcase,
  Wrench,
  Tag,
};

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
  withBg?: boolean;
}

export function CategoryIcon({
  name,
  color = '#3B82F6',
  size = 18,
  className = '',
  withBg = true,
}: CategoryIconProps) {
  const IconComponent = AVAILABLE_ICONS[name] || Tag;

  if (withBg) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl transition-transform ${className}`}
        style={{
          backgroundColor: `${color}1A`, // 10% opacity
          color: color,
          width: size * 2.2,
          height: size * 2.2,
        }}
      >
        <IconComponent size={size} strokeWidth={2.2} />
      </div>
    );
  }

  return <IconComponent size={size} style={{ color }} className={className} strokeWidth={2.2} />;
}
