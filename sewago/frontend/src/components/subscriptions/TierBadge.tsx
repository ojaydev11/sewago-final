'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: 'FREE' | 'PLUS' | 'PRO';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  animated?: boolean;
}

export function TierBadge({ 
  tier, 
  size = 'md', 
  showIcon = true, 
  className,
  animated = false 
}: TierBadgeProps) {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return {
          name: 'SewaGo Pro',
          icon: Crown,
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          textColor: 'text-white',
          borderColor: 'border-yellow-400',
          shadowColor: 'shadow-yellow-200',
          iconColor: 'text-yellow-100'
        };
      case 'PLUS':
        return {
          name: 'SewaGo Plus',
          icon: Star,
          color: 'bg-gradient-to-r from-blue-500 to-purple-600',
          textColor: 'text-white',
          borderColor: 'border-blue-500',
          shadowColor: 'shadow-blue-200',
          iconColor: 'text-blue-100'
        };
      default:
        return {
          name: 'SewaGo Free',
          icon: Heart,
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          shadowColor: 'shadow-gray-100',
          iconColor: 'text-gray-500'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          badge: 'px-4 py-2 text-base font-semibold',
          icon: 'h-6 w-6'
        };
      default:
        return {
          badge: 'px-3 py-1.5 text-sm font-medium',
          icon: 'h-4 w-4'
        };
    }
  };

  const config = getTierConfig(tier);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  const badgeContent = (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full border',
      config.color,
      config.textColor,
      config.borderColor,
      sizeClasses.badge,
      tier === 'PRO' && size === 'lg' && 'shadow-lg',
      tier === 'PRO' && size === 'lg' && config.shadowColor,
      className
    )}>
      {showIcon && (
        <IconComponent className={cn(sizeClasses.icon, config.iconColor)} />
      )}
      <span>{config.name}</span>
      {tier === 'PRO' && size === 'lg' && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="ml-1"
        >
          ✨
        </motion.div>
      )}
    </div>
  );

  if (animated && tier === 'PRO') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
}

// Compact version for use in lists or small spaces
export function CompactTierBadge({ tier }: { tier: 'FREE' | 'PLUS' | 'PRO' }) {
  return <TierBadge tier={tier} size="sm" showIcon={false} />;
}

// Premium animated version for dashboards
export function PremiumTierBadge({ tier }: { tier: 'FREE' | 'PLUS' | 'PRO' }) {
  return <TierBadge tier={tier} size="lg" animated />;
}

// Status indicator version
export function TierStatusBadge({ 
  tier, 
  status 
}: { 
  tier: 'FREE' | 'PLUS' | 'PRO';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
}) {
  const statusConfig = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    EXPIRED: 'bg-orange-100 text-orange-800 border-orange-300'
  };

  return (
    <div className="flex items-center gap-2">
      <TierBadge tier={tier} size="sm" />
      <Badge className={cn('text-xs', statusConfig[status])}>
        {status}
      </Badge>
    </div>
  );
}