'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimationControls } from 'framer-motion';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';
import { useAudioFeedback } from '@/contexts/AudioFeedbackContext';

// Nepali Traditional Pattern Backgrounds
interface NepaliPatternBackgroundProps {
  pattern: 'mandala' | 'endless_knot' | 'lotus' | 'prayer_flags' | 'mountain_silhouette';
  intensity?: 'subtle' | 'medium' | 'prominent';
  colors?: 'traditional' | 'modern' | 'monochrome';
  animated?: boolean;
  className?: string;
}

export const NepaliPatternBackground: React.FC<NepaliPatternBackgroundProps> = ({
  pattern,
  intensity = 'subtle',
  colors = 'traditional',
  animated = false,
  className = ''
}) => {
  const colorSchemes = {
    traditional: {
      primary: '#DC2626', // Red
      secondary: '#F59E0B', // Yellow/Gold
      accent: '#059669', // Green
      neutral: '#6B7280'
    },
    modern: {
      primary: '#3B82F6', // Blue
      secondary: '#8B5CF6', // Purple
      accent: '#10B981', // Emerald
      neutral: '#6B7280'
    },
    monochrome: {
      primary: '#374151', // Gray-700
      secondary: '#6B7280', // Gray-500
      accent: '#9CA3AF', // Gray-400
      neutral: '#E5E7EB'
    }
  };

  const scheme = colorSchemes[colors];
  
  const intensityConfig = {
    subtle: { opacity: 0.05, scale: 1.2 },
    medium: { opacity: 0.15, scale: 1.1 },
    prominent: { opacity: 0.25, scale: 1.0 }
  };

  const config = intensityConfig[intensity];

  const renderMandala = () => (
    <motion.svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      animate={animated ? { rotate: 360 } : {}}
      transition={animated ? { duration: 120, repeat: Infinity, ease: 'linear' } : {}}
      style={{ opacity: config.opacity, transform: `scale(${config.scale})` }}
    >
      {/* Outer ring */}
      <circle cx="200" cy="200" r="180" fill="none" stroke={scheme.primary} strokeWidth="2" strokeDasharray="10,5" />
      <circle cx="200" cy="200" r="160" fill="none" stroke={scheme.secondary} strokeWidth="1.5" strokeDasharray="5,3" />
      
      {/* Middle patterns */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        return (
          <g key={i} transform={`rotate(${angle} 200 200)`}>
            <motion.path
              d="M 200 80 Q 220 100 200 120 Q 180 100 200 80"
              fill={scheme.accent}
              animate={animated ? { scale: [1, 1.1, 1] } : {}}
              transition={animated ? { duration: 3, repeat: Infinity, delay: i * 0.2 } : {}}
            />
          </g>
        );
      })}
      
      {/* Center lotus */}
      <motion.circle
        cx="200"
        cy="200"
        r="40"
        fill={scheme.secondary}
        animate={animated ? { scale: [0.9, 1.1, 0.9] } : {}}
        transition={animated ? { duration: 2, repeat: Infinity } : {}}
      />
    </motion.svg>
  );

  const renderEndlessKnot = () => (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: config.opacity, transform: `scale(${config.scale})` }}
    >
      <motion.path
        d="M100,150 Q150,100 200,150 Q250,200 200,250 Q150,300 100,250 Q50,200 100,150 Z"
        fill="none"
        stroke={scheme.primary}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={animated ? { pathLength: 1 } : { pathLength: 1 }}
        transition={animated ? { duration: 4, repeat: Infinity } : {}}
      />
      <motion.path
        d="M300,150 Q250,100 200,150 Q150,200 200,250 Q250,300 300,250 Q350,200 300,150 Z"
        fill="none"
        stroke={scheme.secondary}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={animated ? { pathLength: 1 } : { pathLength: 1 }}
        transition={animated ? { duration: 4, repeat: Infinity, delay: 0.5 } : {}}
      />
    </svg>
  );

  const renderLotus = () => (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: config.opacity, transform: `scale(${config.scale})` }}
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        return (
          <motion.g
            key={i}
            transform={`rotate(${angle} 200 200)`}
            animate={animated ? { scale: [1, 1.05, 1] } : {}}
            transition={animated ? { duration: 3, repeat: Infinity, delay: i * 0.3 } : {}}
          >
            <path
              d="M200,300 Q180,250 160,200 Q180,150 200,200 Q220,150 240,200 Q220,250 200,300"
              fill={scheme.accent}
              opacity="0.7"
            />
          </motion.g>
        );
      })}
      <circle cx="200" cy="200" r="30" fill={scheme.secondary} />
    </svg>
  );

  const renderPrayerFlags = () => (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: config.opacity, transform: `scale(${config.scale})` }}
    >
      {['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map((color, i) => (
        <motion.rect
          key={i}
          x={50 + i * 60}
          y={100}
          width={50}
          height={30}
          fill={color}
          animate={animated ? { y: [100, 95, 100] } : {}}
          transition={animated ? { duration: 2, repeat: Infinity, delay: i * 0.2 } : {}}
        />
      ))}
      <line x1="40" y1="115" x2="360" y2="115" stroke={scheme.neutral} strokeWidth="2" />
    </svg>
  );

  const renderMountainSilhouette = () => (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: config.opacity, transform: `scale(${config.scale})` }}
    >
      <motion.path
        d="M0,350 L50,250 L100,200 L150,150 L200,100 L250,150 L300,200 L350,250 L400,300 L400,400 L0,400 Z"
        fill={scheme.primary}
        initial={{ y: 50 }}
        animate={animated ? { y: [50, 45, 50] } : { y: 50 }}
        transition={animated ? { duration: 4, repeat: Infinity } : {}}
      />
      <motion.path
        d="M0,380 L80,300 L160,250 L240,200 L320,250 L400,300 L400,400 L0,400 Z"
        fill={scheme.secondary}
        initial={{ y: 30 }}
        animate={animated ? { y: [30, 25, 30] } : { y: 30 }}
        transition={animated ? { duration: 3, repeat: Infinity, delay: 0.5 } : {}}
      />
    </svg>
  );

  const renderPattern = () => {
    switch (pattern) {
      case 'mandala': return renderMandala();
      case 'endless_knot': return renderEndlessKnot();
      case 'lotus': return renderLotus();
      case 'prayer_flags': return renderPrayerFlags();
      case 'mountain_silhouette': return renderMountainSilhouette();
      default: return renderMandala();
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {renderPattern()}
    </div>
  );
};

// Festival Celebration Animation
interface FestivalCelebrationProps {
  festival: 'dashain' | 'tihar' | 'holi' | 'buddha_jayanti' | 'gai_jatra' | 'teej';
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const FestivalCelebration: React.FC<FestivalCelebrationProps> = ({
  festival,
  active,
  duration = 5000,
  onComplete
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const { playSound, preferences } = useAudioFeedback();
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    if (!active) return;

    const startCelebration = async () => {
      // Play festival sound
      if (preferences?.soundEnabled) {
        const soundMap = {
          dashain: 'dashain_drums',
          tihar: 'tihar_deusi',
          holi: 'nepali_celebration',
          buddha_jayanti: 'nepali_bell',
          gai_jatra: 'nepali_celebration',
          teej: 'nepali_singing_bowl'
        };
        
        await playSound(soundMap[festival] || 'nepali_celebration');
      }

      // Trigger cultural haptic pattern
      await triggerHaptic('nepali_celebration', { culturalContext: true });

      // Generate particles
      generateFestivalParticles();
    };

    startCelebration();

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, festival, duration, onComplete, preferences, playSound, triggerHaptic]);

  const generateFestivalParticles = () => {
    const particleConfig = {
      dashain: { colors: ['#DC2626', '#F59E0B', '#059669'], count: 50 },
      tihar: { colors: ['#F59E0B', '#FBBF24', '#FCD34D'], count: 40 },
      holi: { colors: ['#EC4899', '#8B5CF6', '#10B981', '#F59E0B'], count: 60 },
      buddha_jayanti: { colors: ['#F59E0B', '#FBBF24'], count: 30 },
      gai_jatra: { colors: ['#DC2626', '#F59E0B'], count: 35 },
      teej: { colors: ['#DC2626', '#059669'], count: 45 }
    };

    const config = particleConfig[festival];
    const newParticles = Array.from({ length: config.count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 10 + 5
    }));

    setParticles(newParticles);
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color
            }}
            initial={{
              scale: 0,
              opacity: 1,
              y: 0,
              rotate: 0
            }}
            animate={{
              scale: [0, 1, 0.8, 0],
              opacity: [1, 1, 0.5, 0],
              y: [-50, -100, -150, -200],
              rotate: [0, 180, 360],
              x: [0, Math.random() * 50 - 25]
            }}
            transition={{
              duration: 3,
              ease: 'easeOut',
              delay: Math.random() * 2
            }}
            onAnimationComplete={() => {
              setParticles(prev => prev.filter(p => p.id !== particle.id));
            }}
          />
        ))}
      </AnimatePresence>

      {/* Festival-specific overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-yellow-400 shadow-2xl">
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {getFestivalEmoji(festival)}
          </motion.div>
          <motion.h2
            className="text-3xl font-bold text-red-600 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {getFestivalGreeting(festival, 'en')}
          </motion.h2>
          <motion.h3
            className="text-2xl font-semibold text-gray-800 devanagari-font"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {getFestivalGreeting(festival, 'ne')}
          </motion.h3>
        </div>
      </motion.div>
    </div>
  );
};

// Cultural Color Palette Picker
interface CulturalColorPaletteProps {
  onColorSelect: (palette: CulturalPalette) => void;
  selectedPalette?: string;
  variant?: 'traditional' | 'modern' | 'festival';
}

interface CulturalPalette {
  name: string;
  nameNe: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  culturalContext: string;
}

export const CulturalColorPalette: React.FC<CulturalColorPaletteProps> = ({
  onColorSelect,
  selectedPalette,
  variant = 'traditional'
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { playSound } = useAudioFeedback();

  const palettes: CulturalPalette[] = [
    {
      name: 'Traditional Red',
      nameNe: 'पारम्परिक रातो',
      colors: { primary: '#DC2626', secondary: '#F59E0B', accent: '#059669', background: '#FEF2F2' },
      culturalContext: 'Traditional Nepali colors representing prosperity and good fortune'
    },
    {
      name: 'Himalayan Blue',
      nameNe: 'हिमालयी नीलो',
      colors: { primary: '#1E40AF', secondary: '#F0F9FF', accent: '#0EA5E9', background: '#F0F9FF' },
      culturalContext: 'Inspired by the clear mountain skies and sacred waters'
    },
    {
      name: 'Terai Green',
      nameNe: 'तराई हरियो',
      colors: { primary: '#059669', secondary: '#ECFDF5', accent: '#10B981', background: '#ECFDF5' },
      culturalContext: 'Representing the lush green plains and agricultural prosperity'
    },
    {
      name: 'Festival Gold',
      nameNe: 'चाडको सुनौलो',
      colors: { primary: '#D97706', secondary: '#FEF3C7', accent: '#F59E0B', background: '#FFFBEB' },
      culturalContext: 'Golden hues used in traditional festivals and celebrations'
    },
    {
      name: 'Prayer Orange',
      nameNe: 'प्रार्थना सुन्तला',
      colors: { primary: '#EA580C', secondary: '#FED7AA', accent: '#FB923C', background: '#FFF7ED' },
      culturalContext: 'Sacred saffron colors used in religious ceremonies'
    }
  ];

  const handlePaletteSelect = async (palette: CulturalPalette) => {
    await triggerHaptic('selection', { culturalContext: true });
    await playSound('nepali_chime', { volume: 20 });
    onColorSelect(palette);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {palettes.map((palette, index) => (
        <motion.div
          key={palette.name}
          className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
            selectedPalette === palette.name 
              ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-400/50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaletteSelect(palette)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Color Preview */}
          <div className="h-24 flex">
            <div 
              className="flex-1" 
              style={{ backgroundColor: palette.colors.primary }}
            />
            <div 
              className="flex-1" 
              style={{ backgroundColor: palette.colors.secondary }}
            />
            <div 
              className="flex-1" 
              style={{ backgroundColor: palette.colors.accent }}
            />
          </div>

          {/* Palette Info */}
          <div className="p-4" style={{ backgroundColor: palette.colors.background }}>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {palette.name}
            </h3>
            <p className="text-lg text-gray-700 mb-2 devanagari-font">
              {palette.nameNe}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {palette.culturalContext}
            </p>

            {/* Selected indicator */}
            <AnimatePresence>
              {selectedPalette === palette.name && (
                <motion.div
                  className="flex items-center mt-3 text-sm font-medium text-yellow-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected / चयनित
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Traditional Typography Component
interface CulturalTypographyProps {
  text: string;
  textNe?: string;
  variant?: 'heading' | 'subheading' | 'body' | 'display';
  style?: 'traditional' | 'modern' | 'ceremonial';
  showBoth?: boolean;
  animated?: boolean;
}

export const CulturalTypography: React.FC<CulturalTypographyProps> = ({
  text,
  textNe,
  variant = 'body',
  style = 'traditional',
  showBoth = false,
  animated = false
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const variantClasses = {
    display: 'text-4xl md:text-6xl font-bold',
    heading: 'text-2xl md:text-3xl font-bold',
    subheading: 'text-lg md:text-xl font-semibold',
    body: 'text-base md:text-lg'
  };

  const styleClasses = {
    traditional: 'text-red-700',
    modern: 'text-gray-800',
    ceremonial: 'text-yellow-600'
  };

  const nepaliStyleClasses = {
    traditional: 'text-red-600 devanagari-font',
    modern: 'text-gray-700 devanagari-font',
    ceremonial: 'text-yellow-700 devanagari-font font-bold'
  };

  return (
    <div ref={ref} className="text-center space-y-2">
      {/* English text */}
      <motion.h1
        className={`${variantClasses[variant]} ${styleClasses[style]}`}
        initial={animated ? { opacity: 0, y: 30 } : {}}
        animate={animated && isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {text}
      </motion.h1>

      {/* Nepali text */}
      {(textNe || showBoth) && (
        <motion.h2
          className={`${variantClasses[variant === 'display' ? 'heading' : variant]} ${nepaliStyleClasses[style]}`}
          initial={animated ? { opacity: 0, y: 30 } : {}}
          animate={animated && isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {textNe || text}
        </motion.h2>
      )}

      {/* Decorative element */}
      {style === 'ceremonial' && (
        <motion.div
          className="flex justify-center mt-4"
          initial={animated ? { opacity: 0, scale: 0.5 } : {}}
          animate={animated && isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full" />
        </motion.div>
      )}
    </div>
  );
};

// Helper functions
const getFestivalEmoji = (festival: string): string => {
  const emojiMap: Record<string, string> = {
    dashain: '🎉',
    tihar: '🪔',
    holi: '🎨',
    buddha_jayanti: '☸️',
    gai_jatra: '🐄',
    teej: '💃'
  };
  return emojiMap[festival] || '🎉';
};

const getFestivalGreeting = (festival: string, language: 'en' | 'ne'): string => {
  const greetings: Record<string, { en: string; ne: string }> = {
    dashain: { 
      en: 'Happy Dashain!', 
      ne: 'दशैंको शुभकामना!' 
    },
    tihar: { 
      en: 'Happy Tihar!', 
      ne: 'तिहारको शुभकामना!' 
    },
    holi: { 
      en: 'Happy Holi!', 
      ne: 'होलीको शुभकामना!' 
    },
    buddha_jayanti: { 
      en: 'Happy Buddha Jayanti!', 
      ne: 'बुद्ध जयन्तीको शुभकामना!' 
    },
    gai_jatra: { 
      en: 'Happy Gai Jatra!', 
      ne: 'गाई जात्राको शुभकामना!' 
    },
    teej: { 
      en: 'Happy Teej!', 
      ne: 'तीजको शुभकामना!' 
    }
  };

  return greetings[festival]?.[language] || 'Happy Festival!';
};