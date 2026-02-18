type Props = {
  text: string;
  className?: string;
};

function splitIntoParagraphs(rawText: string) {
  return rawText
    .split(/\n{2,}/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function LegacyTextRenderer({ text, className }: Props) {
  const paragraphs = splitIntoParagraphs(text);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className={className ?? "space-y-6"}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="whitespace-pre-wrap break-words text-base leading-7 sm:text-lg sm:leading-8"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
