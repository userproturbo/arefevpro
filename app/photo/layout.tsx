import PhotoSectionController from "@/app/components/photo/PhotoSectionController";

export default function PhotoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PhotoSectionController />
      {children}
    </>
  );
}
