import { useRef, useCallback } from 'react';

export function useSound(soundUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    }
    
    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }, [soundUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
}