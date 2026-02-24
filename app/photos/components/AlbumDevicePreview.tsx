import Image from "next/image";
import { useId } from "react";

type AlbumDevicePreviewProps = {
  src: string;
  alt: string;
  blurDataURL?: string | null;
  priority?: boolean;
  className?: string;
};

const FALLBACK_BLUR =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0d0d11" />
          <stop offset="100%" stop-color="#18181b" />
        </linearGradient>
      </defs>
      <rect width="16" height="10" fill="url(#g)" />
    </svg>`,
  );

export default function AlbumDevicePreview({
  src,
  alt,
  blurDataURL,
  priority = false,
  className = "",
}: AlbumDevicePreviewProps) {
  const uniqueId = useId();
  const clipId = `${uniqueId}-clip0_67_4`;
  const filter0Id = `${uniqueId}-filter0_d_67_4`;
  const filter1Id = `${uniqueId}-filter1_d_67_4`;

  return (
    <div className={`relative aspect-[424/264] w-full ${className}`}>
      <div
        className="absolute overflow-hidden"
        style={{
          left: "9.43%",
          top: "17.23%",
          width: "79.48%",
          height: "49.62%",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={80}
          placeholder="blur"
          blurDataURL={blurDataURL || FALLBACK_BLUR}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <svg
        className="absolute left-0 top-0 w-full pointer-events-none"
        viewBox="0 0 424 264"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath={`url(#${clipId})`}>
          <path d="M424 264H0V0H424V264ZM29 30V195H401V30H29Z" fill="none" />
          <g filter={`url(#${filter0Id})`}>
            <path d="M383.009 196.5H280.5H175C171.686 196.5 169 199.186 169 202.5V224.5C169 227.814 171.686 230.5 175 230.5H370.068C372.195 230.5 374.162 229.375 375.24 227.542L388.181 205.542C390.534 201.542 387.65 196.5 383.009 196.5Z" fill="#27272C" />
            <path d="M383.009 196.5H280.5H175C171.686 196.5 169 199.186 169 202.5V224.5C169 227.814 171.686 230.5 175 230.5H370.068C372.195 230.5 374.162 229.375 375.24 227.542L388.181 205.542C390.534 201.542 387.65 196.5 383.009 196.5Z" stroke="#32323A" />
          </g>
          <g filter={`url(#${filter1Id})`}>
            <path d="M399 17C402.866 17 406 20.134 406 24V199C406 202.866 402.866 206 399 206H197.472C195.008 206 192.726 207.295 191.463 209.409L171.037 243.591C169.774 245.705 167.492 247 165.028 247H25C21.134 247 18 243.866 18 240V24C18 20.134 21.134 17 25 17H399ZM47 38.5C43.134 38.5 40 41.634 40 45.5V176.5C40 180.366 43.134 183.5 47 183.5H377C380.866 183.5 384 180.366 384 176.5V45.5C384 41.634 380.866 38.5 377 38.5H47Z" fill="#18181B" />
            <path d="M171.037 243.591L170.608 243.334L171.037 243.591ZM406 24H405.5V199H406H406.5V24H406ZM399 206V205.5H197.472V206V206.5H399V206ZM191.463 209.409L191.034 209.153L170.608 243.334L171.037 243.591L171.466 243.847L191.892 209.666L191.463 209.409ZM165.028 247V246.5H25V247V247.5H165.028V247ZM18 240H18.5V24H18H17.5V240H18ZM25 17V17.5H399V17V16.5H25V17ZM40 45.5H39.5V176.5H40H40.5V45.5H40ZM47 183.5V184H377V183.5V183H47V183.5ZM384 176.5H384.5V45.5H384H383.5V176.5H384ZM377 38.5V38H47V38.5V39H377V38.5ZM384 45.5H384.5C384.5 41.3579 381.142 38 377 38V38.5V39C380.59 39 383.5 41.9102 383.5 45.5H384ZM377 183.5V184C381.142 184 384.5 180.642 384.5 176.5H384H383.5C383.5 180.09 380.59 183 377 183V183.5ZM40 176.5H39.5C39.5 180.642 42.8579 184 47 184V183.5V183C43.4101 183 40.5 180.09 40.5 176.5H40ZM40 45.5H40.5C40.5 41.9101 43.4102 39 47 39V38.5V38C42.8579 38 39.5 41.3579 39.5 45.5H40ZM18 24H18.5C18.5 20.4102 21.4101 17.5 25 17.5V17V16.5C20.8579 16.5 17.5 19.8579 17.5 24H18ZM25 247V246.5C21.4102 246.5 18.5 243.59 18.5 240H18H17.5C17.5 244.142 20.8579 247.5 25 247.5V247ZM171.037 243.591L170.608 243.334C169.435 245.298 167.316 246.5 165.028 246.5V247V247.5C167.668 247.5 170.113 246.113 171.466 243.847L171.037 243.591ZM197.472 206V205.5C194.832 205.5 192.387 206.887 191.034 209.153L191.463 209.409L191.892 209.666C193.065 207.702 195.184 206.5 197.472 206.5V206ZM406 199H405.5C405.5 202.59 402.59 205.5 399 205.5V206V206.5C403.142 206.5 406.5 203.142 406.5 199H406ZM406 24H406.5C406.5 19.8579 403.142 16.5 399 16.5V17V17.5C402.59 17.5 405.5 20.4101 405.5 24H406Z" fill="#232327" />
          </g>
          <path d="M192 227.5H201L211.5 209.5H202.5L192 227.5Z" fill="#43434E" />
          <path d="M208.5 227.5H217.5L228 209.5H219L208.5 227.5Z" fill="#43434E" />
          <path d="M225 227.5H234L244.5 209.5H235.5L225 227.5Z" fill="#43434E" />
          <path d="M241.5 227.5H250.5L261 209.5H252L241.5 227.5Z" fill="#43434E" />
          <path d="M258 227.5H267L277.5 209.5H268.5L258 227.5Z" fill="#43434E" />
          <path d="M274.5 227.5H283.5L294 209.5H285L274.5 227.5Z" fill="#43434E" />
          <path d="M291 227.5H300L310.5 209.5H301.5L291 227.5Z" fill="#43434E" />
          <path d="M307.5 227.5H316.5L327 209.5H318L307.5 227.5Z" fill="#43434E" />
          <path d="M324 227.5H333L343.5 209.5H334.5L324 227.5Z" fill="#43434E" />
          <path d="M340.5 227.5H349.5L360 209.5H351L340.5 227.5Z" fill="#43434E" />
          <path d="M357 227.5H366L376.5 209.5H367.5L357 227.5Z" fill="#43434E" />
          <path d="M239 194H389.5C392.814 194 395.5 191.314 395.5 188V135" stroke="#515158" />
          <path d="M185.5 25.5L35 25.5C31.6863 25.5 29 28.1863 29 31.5V84.5" stroke="#515158" />
          <circle cx="186" cy="25.5" r="4" fill="#515158" />
          <circle cx="29" cy="84.5" r="4" fill="#515158" />
          <circle cx="238" cy="194.5" r="4" fill="#515158" />
          <circle cx="396" cy="136.5" r="4" fill="#515158" />
          <path d="M171.444 198.5H44C40.6863 198.5 38 201.186 38 204.5V232.5C38 235.814 40.6863 238.5 44 238.5H153.244C155.275 238.5 157.168 237.473 158.275 235.77L176.475 207.77C179.069 203.778 176.205 198.5 171.444 198.5Z" fill="#25252B" />
          <text
            fill="#67676E"
            fontFamily="Inter"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="0.09em"
          >
            <tspan x="50" y="225.773">
              OPEN ARCHIVE
            </tspan>
          </text>
        </g>
        <defs>
          <filter
            id={filter0Id}
            x="167.324"
            y="195"
            width="222.637"
            height="37"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.5" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0235294 0 0 0 0 0.0235294 0 0 0 0 0.027451 0 0 0 1 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_67_4" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_67_4" result="shape" />
          </filter>
          <filter
            id={filter1Id}
            x="0.5"
            y="-0.5"
            width="423"
            height="264.5"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="8.75" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0235294 0 0 0 0 0.0235294 0 0 0 0 0.027451 0 0 0 1 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_67_4" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_67_4" result="shape" />
          </filter>
          <clipPath id={clipId}>
            <rect width="424" height="264" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
