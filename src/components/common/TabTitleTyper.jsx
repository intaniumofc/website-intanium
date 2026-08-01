'use client';

import { useEffect } from 'react';

const WORDS = ['Inclusive', 'Resonance', 'Interaction', 'Synergy'];
const PREFIX = 'IRIS Official | ';

export default function TabTitleTyper() {
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = null;

    const typeEffect = () => {
      if (document.hidden) {
        timeoutId = setTimeout(typeEffect, 1000);
        return;
      }

      const currentWord = WORDS[wordIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      const currentText = currentWord.substring(0, charIndex);
      document.title = `${PREFIX}${currentText}`;

      let speed = isDeleting ? 100 : 180;

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause when full word is typed
        speed = 3000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        // Move to next word when fully erased
        isDeleting = false;
        wordIndex = (wordIndex + 1) % WORDS.length;
        speed = 500;
      }

      timeoutId = setTimeout(typeEffect, speed);
    };

    timeoutId = setTimeout(typeEffect, 600);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
