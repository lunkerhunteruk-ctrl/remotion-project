import React, { useEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";

/**
 * Web Audio API based synthesized tap sound
 * Fallback when external audio files are not available
 */
export const SynthTapSound: React.FC<{
  volume?: number;
  frequency?: number;
}> = ({ volume = 0.3, frequency = 800 }) => {
  const frame = useCurrentFrame();
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedRef = useRef(false);
  const isClosedRef = useRef(false);

  useEffect(() => {
    // Only play on frame 0 of this sequence
    if (frame === 0 && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      isClosedRef.current = false;

      try {
        const AudioContextClass = window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) {
          console.log("Web Audio API not supported");
          return;
        }

        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const now = audioContext.currentTime;

        // Main tone oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + 0.08);

        // Secondary harmonic for richness
        const oscillator2 = audioContext.createOscillator();
        oscillator2.type = "sine";
        oscillator2.frequency.setValueAtTime(frequency * 1.5, now);
        oscillator2.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 0.05);

        // Gain envelope for tap-like attack
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        const gainNode2 = audioContext.createGain();
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(volume * 0.3, now + 0.003);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        // Filter for warmth
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(1, now);

        // Connect nodes
        oscillator.connect(gainNode);
        oscillator2.connect(gainNode2);
        gainNode.connect(filter);
        gainNode2.connect(filter);
        filter.connect(audioContext.destination);

        // Play
        oscillator.start(now);
        oscillator2.start(now);
        oscillator.stop(now + 0.15);
        oscillator2.stop(now + 0.1);

        // Cleanup after sound finishes
        setTimeout(() => {
          if (audioContextRef.current && !isClosedRef.current) {
            isClosedRef.current = true;
            audioContextRef.current.close().catch(() => {
              // Ignore close errors
            });
            audioContextRef.current = null;
          }
        }, 200);
      } catch (error) {
        console.log("Web Audio API error:", error);
      }
    }

    return () => {
      // Cleanup on unmount - but check if already closed
      if (audioContextRef.current && !isClosedRef.current) {
        isClosedRef.current = true;
        audioContextRef.current.close().catch(() => {
          // Ignore close errors
        });
        audioContextRef.current = null;
      }
    };
  }, [frame, frequency, volume]);

  return null;
};

/**
 * Synthesized sizzle/cooking sound
 */
export const SynthSizzleSound: React.FC<{
  volume?: number;
  duration?: number;
}> = ({ volume = 0.2, duration = 2 }) => {
  const frame = useCurrentFrame();
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const hasStartedRef = useRef(false);
  const isClosedRef = useRef(false);

  useEffect(() => {
    if (frame === 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      isClosedRef.current = false;

      try {
        const AudioContextClass = window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) {
          console.log("Web Audio API not supported");
          return;
        }

        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const now = audioContext.currentTime;

        // Create white noise buffer
        const bufferSize = audioContext.sampleRate * duration;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const crackle = Math.random() > 0.7 ? Math.random() * 0.5 + 0.5 : 0.3;
          output[i] = (Math.random() * 2 - 1) * crackle;
        }

        const noiseNode = audioContext.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNodeRef.current = noiseNode;

        // Bandpass filter for sizzle character
        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(3000, now);
        bandpass.Q.setValueAtTime(0.5, now);

        // High shelf for brightness
        const highShelf = audioContext.createBiquadFilter();
        highShelf.type = "highshelf";
        highShelf.frequency.setValueAtTime(5000, now);
        highShelf.gain.setValueAtTime(3, now);

        // Gain envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.3);
        gainNode.gain.setValueAtTime(volume, now + duration - 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Connect
        noiseNode.connect(bandpass);
        bandpass.connect(highShelf);
        highShelf.connect(gainNode);
        gainNode.connect(audioContext.destination);

        noiseNode.start(now);
        noiseNode.stop(now + duration);

        setTimeout(() => {
          if (audioContextRef.current && !isClosedRef.current) {
            isClosedRef.current = true;
            audioContextRef.current.close().catch(() => {
              // Ignore close errors
            });
            audioContextRef.current = null;
          }
        }, duration * 1000 + 100);
      } catch (error) {
        console.log("Web Audio API error:", error);
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
        } catch {
          // Already stopped
        }
        noiseNodeRef.current = null;
      }
      if (audioContextRef.current && !isClosedRef.current) {
        isClosedRef.current = true;
        audioContextRef.current.close().catch(() => {
          // Ignore close errors
        });
        audioContextRef.current = null;
      }
    };
  }, [frame, volume, duration]);

  return null;
};
