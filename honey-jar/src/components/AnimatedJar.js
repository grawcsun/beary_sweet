import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedJar({ count, size = 'medium', onClick, isToday, skipAnimation = false }) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCount = useRef(count);
  const isInitialMount = useRef(true);

  // Get jar state based on count (0, 1, 2, or 3 drops)
  const getJarState = (dropCount) => {
    if (dropCount === 0) return 'empty';
    if (dropCount === 1) return 'onethird';
    if (dropCount === 2) return 'twothird';
    return 'full';
  };

  const getStaticImage = (state) => {
    const images = {
      empty: `${process.env.PUBLIC_URL}/emptyjar.png`,
      onethird: `${process.env.PUBLIC_URL}/onethirdjar.png`,
      twothird: `${process.env.PUBLIC_URL}/twothirdjar.png`,
      full: `${process.env.PUBLIC_URL}/fulljar.png`
    };
    return images[state];
  };

  // Animate jar filling/emptying
  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousCount.current = count;
      return;
    }

    if (previousCount.current === count) return;

    // Skip animation if explicitly disabled (e.g., when navigating between days)
    if (skipAnimation) {
      previousCount.current = count;
      return;
    }

    const oldCount = previousCount.current;
    const newCount = count;
    const isAdding = newCount > oldCount;

    // Determine which frames to animate through
    let startFrame, endFrame;

    if (isAdding) {
      // Adding honey drop - animate forward through frames
      if (oldCount === 0 && newCount === 1) {
        startFrame = 1; endFrame = 9;
      } else if (oldCount === 1 && newCount === 2) {
        startFrame = 10; endFrame = 18;
      } else if (oldCount === 2 && newCount === 3) {
        startFrame = 19; endFrame = 27;
      }
    } else {
      // Removing honey drop - animate backward from checkpoint
      if (oldCount === 3 && newCount === 2) {
        startFrame = 27; endFrame = 19;
      } else if (oldCount === 2 && newCount === 1) {
        startFrame = 18; endFrame = 10;
      } else if (oldCount === 1 && newCount === 0) {
        startFrame = 9; endFrame = 1;
      }
    }

    // Animate through frames
    if (startFrame && endFrame) {
      setIsAnimating(true);
      const step = isAdding ? 1 : -1;
      const frames = [];
      for (let i = startFrame; isAdding ? i <= endFrame : i >= endFrame; i += step) {
        frames.push(i);
      }

      let frameIndex = 0;
      const interval = setInterval(() => {
        if (frameIndex < frames.length) {
          setCurrentFrame(frames[frameIndex]);
          frameIndex++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
          previousCount.current = newCount;
        }
      }, 200); // 200ms per frame for smoother, faster animation

      return () => clearInterval(interval);
    } else {
      // If no animation needed, still update previousCount
      previousCount.current = newCount;
    }
  }, [count, skipAnimation]);

  const sizes = {
    small: { width: 70, height: 96 },
    medium: { width: 80, height: 110 },
    large: { width: 120, height: 165 },
    xlarge: { width: 150, height: 206 }
  };

  const jarSize = sizes[size];

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-110"
      style={{
        width: jarSize.width,
        height: jarSize.height,
        position: 'relative'
      }}
    >
      <img
        src={isAnimating ? `${process.env.PUBLIC_URL}/filljar${currentFrame}.png` : getStaticImage(getJarState(count))}
        alt="Honey Jar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: '-webkit-optimize-contrast',
          WebkitFontSmoothing: 'antialiased',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        onError={(e) => {
          console.error(`Failed to load jar image`);
        }}
      />
      {isToday && (
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#FF8C00',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap'
        }}>
        </div>
      )}
    </div>
  );
}
