"use client";

import LayeredNavCharacter, { type LayeredNavCharacterBaseProps } from "./LayeredNavCharacter";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function BlogNavCharacter(props: LayeredNavCharacterBaseProps) {
  const microMotionProgress = 0.2;

  return (
    <LayeredNavCharacter
      {...props}
      idleSrc="/img/Blog-idle.png"
      actionSrc="/img/Blog-action.png"
      audioSrc="/audio/drawing.mp3"
      audioVolume={0.55}
      motionConfig={{
        intentDelayMs: 180,
        enterSpeed: 0.085,
        leaveSpeed: 0.075,
        microMotionProgress,
      }}
      getMotionStyle={(progress, timeMs) => {
        const idleWave = Math.sin(timeMs * 0.0018);
        const hoverWave = Math.sin(timeMs * 0.0023);
        const actionMix = clamp((progress - microMotionProgress) / (1 - microMotionProgress));
        const wave = idleWave * (1 - actionMix) + hoverWave * actionMix;
        const scale = 1 + 0.01 * (1 - actionMix) * (wave * 0.5 + 0.5) + actionMix * 0.06;
        const rotateZ = wave * (0.3 + 0.3 * actionMix);
        const translateZ = progress * 35;

        return {
          wrapperTransform: `translate3d(0, 0, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`,
          actionOpacity: actionMix,
        };
      }}
    />
  );
}
