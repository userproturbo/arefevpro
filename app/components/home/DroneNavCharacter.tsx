"use client";

import LayeredNavCharacter, { type LayeredNavCharacterBaseProps } from "./LayeredNavCharacter";

export default function DroneNavCharacter(props: LayeredNavCharacterBaseProps) {
  const microMotionProgress = 0.22;

  return (
    <LayeredNavCharacter
      {...props}
      idleSrc="/img/Drone-idle.png"
      actionSrc="/img/Drone-action.png"
      audioSrc="/audio/Drone.mp3"
      audioVolume={0.6}
      soundThreshold={0.9}
      resetThreshold={0.25}
      motionConfig={{
        intentDelayMs: 140,
        enterSpeed: 0.11,
        leaveSpeed: 0.09,
        microMotionProgress,
      }}
      getMotionStyle={(progress) => {
        const translateZ = 60 * progress;
        const translateX = 12 * progress;
        const scale = 1 + 0.08 * progress;
        const rotateY = 6 * progress;
        const actionOpacity = Math.min(1, Math.max(0, (progress - microMotionProgress) / (1 - microMotionProgress)));

        return {
          wrapperTransform: `translate3d(${translateX}px, 0, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
          actionOpacity,
        };
      }}
    />
  );
}
