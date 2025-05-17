
import confetti from 'canvas-confetti';

export const triggerSuccessConfetti = () => {
  // Default confetti burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#D946EF', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'],
  });

  // Follow up with some smaller bursts for a celebratory effect
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.7, x: 0.3 },
      colors: ['#D946EF', '#8B5CF6', '#10B981'],
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.7, x: 0.7 },
      colors: ['#3B82F6', '#EC4899', '#10B981'],
    });
  }, 400);
};
