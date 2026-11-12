import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom hook providing GSAP animations tailored to the FitHub Midnight Kinetic theme.
 * Seamlessly respects prefers-reduced-motion for WCAG accessibility.
 */
export function useGsapAnimations() {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /**
   * Staggered entrance for dashboard metric and stat cards
   */
  const animateCardsIn = (selector, options = {}) => {
    if (prefersReducedMotion.current) return;
    return gsap.fromTo(
      selector,
      {
        opacity: 0,
        y: 24,
        scale: 0.98
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
        ...options
      }
    );
  };

  /**
   * Smooth entrance for dialogs and modals
   */
  const animateModalIn = (element, options = {}) => {
    if (!element || prefersReducedMotion.current) return;
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.92,
        y: 16
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: 'back.out(1.4)',
        ...options
      }
    );
  };

  /**
   * Smooth fade-in for page transitions or lists
   */
  const animateFadeIn = (element, options = {}) => {
    if (!element || prefersReducedMotion.current) return;
    return gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 12
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        ...options
      }
    );
  };

  /**
   * Glowing pulse effect for 5-day expiration warnings
   */
  const animateWarningPulse = (element) => {
    if (!element || prefersReducedMotion.current) return;
    return gsap.to(element, {
      boxShadow: '0 0 28px 4px rgba(245, 158, 11, 0.45)',
      repeat: -1,
      yoyo: true,
      duration: 1.6,
      ease: 'sine.inOut'
    });
  };

  return {
    animateCardsIn,
    animateModalIn,
    animateFadeIn,
    animateWarningPulse,
    gsap
  };
}
