"use client";

import LayeredNavCharacter, { type LayeredNavCharacterBaseProps } from "./LayeredNavCharacter";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function PhotoNavCharacter(props: LayeredNavCharacterBaseProps) {
  return (
    <LayeredNavCharacter
      {...props}
      idleSrc="/img/Photo-idle.png"
      actionSrc="/img/Photo-action.png"
      audioSrc="/audio/camera.mp3"
      audioVolume={0.7}
      soundThreshold={0.95}
      resetThreshold={0.2}
      motionConfig={{
        intentDelayMs: 140,
        enterSpeed: 0.12,
        leaveSpeed: 0.1,
        microMotionProgress: 0.3,
      }}
      getMotionStyle={(progress) => {
        const actionOpacity = clamp((progress - 0.3) / 0.7);
        const translateY = -10 * progress;
        const translateX = 2 * progress;
        const scale = 1 + 0.04 * progress;
        const rotateZ = -2 * progress;

        return {
          wrapperTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateZ(${rotateZ}deg)`,
          actionOpacity,
        };
      }}
    />
  );
}
