"use client";

import LayeredNavCharacter, { type LayeredNavCharacterBaseProps } from "./LayeredNavCharacter";

export default function HomeNavCharacter(props: LayeredNavCharacterBaseProps) {
  return (
    <LayeredNavCharacter
      {...props}
      idleSrc="/img/Home.png"
      actionSrc="/img/Home.png"
      audioSrc="/audio/Drone.mp3"
      audioVolume={0.25}
      actionImageClassName="scale-[1.04] brightness-110 saturate-125"
    />
  );
}
