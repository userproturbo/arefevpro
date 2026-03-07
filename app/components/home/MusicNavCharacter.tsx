"use client";

import LayeredNavCharacter, { type LayeredNavCharacterBaseProps } from "./LayeredNavCharacter";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function MusicNavCharacter(props: LayeredNavCharacterBaseProps) {
  const microMotionProgress = 0.24;

  return (
    <LayeredNavCharacter
      {...props}
      disableStageDepthEffects
      disableButtonYMotion
      disableIdleBobYMotion
      disableProximityLift
      disableLookMotion
      actionImageClassName="object-cover object-center scale-[1.14]"
      idleSrc="/img/Music-idle.png"
      actionSrc="/img/Music-action.png"
      audioSrc="/audio/Music.mp3"
      audioVolume={0.62}
      motionConfig={{
        intentDelayMs: 120,
        enterSpeed: 0.115,
        leaveSpeed: 0.092,
        microMotionProgress,
      }}
      getMotionStyle={(progress, timeMs) => {
        const pulseBase = Math.sin(timeMs * 0.0038);
        const pulseActive = Math.sin(timeMs * 0.007);
        const activeMix = clamp((progress - microMotionProgress) / (1 - microMotionProgress));
        const pulse = pulseBase * (1 - activeMix) + pulseActive * activeMix;
        const scale = Math.max(1, 1 + activeMix * 0.12);
        const rotateZ = pulse * (0.35 + 0.65 * activeMix);
        const translateZ = activeMix * 60;
        const actionOpacity = activeMix;
        const brightness = 1 + activeMix * 0.08;

        return {
          wrapperTransform: `translate3d(0, 0, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`,
          actionOpacity,
          wrapperFilter: `brightness(${brightness.toFixed(3)})`,
          wrapperTransformOrigin: "center bottom",
        };
      }}
    />
  );
}
