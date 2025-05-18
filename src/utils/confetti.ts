
import confetti from 'canvas-confetti';

export const triggerSuccessConfetti = () => {
  // Initial burst from multiple positions
  const colors = ['#D946EF', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'];
  
  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
  });

  // Left side burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: colors,
    });
  }, 250);

  // Right side burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: colors,
    });
  }, 400);

  // Final celebratory shot
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.7 },
      gravity: 0.8,
      drift: 2,
      ticks: 300,
      colors: colors,
    });
  }, 650);
};

// Add a specific animation for new sign-ups that's extra celebratory
export const triggerSignUpConfetti = () => {
  const colors = ['#D946EF', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'];
  
  // Initial burst - more particles for sign-up
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: colors,
  });

  // Shoot from left and right simultaneously
  setTimeout(() => {
    // Left cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    
    // Right cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });
  }, 200);

  // Finale with gravity effect
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.5 },
      gravity: 0.7,
      scalar: 1.2,
      drift: 1,
      ticks: 400,
      colors: colors,
      shapes: ['circle', 'square'],
    });
  }, 600);
};
