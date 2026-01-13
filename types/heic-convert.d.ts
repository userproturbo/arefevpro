declare module "heic-convert" {
  type HeicConvertInput = Buffer | Uint8Array;

  type HeicConvertOptions = {
    buffer: HeicConvertInput;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  const heicConvert: (options: HeicConvertOptions) => Promise<HeicConvertInput>;

  export default heicConvert;
}
