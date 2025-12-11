export default function HomeGallery() {
  return (
    <div className="
      fixed 
      bottom-0 
      left-14 
      right-0 
      px-10 
      py-8 
      bg-black/30 
      backdrop-blur-xl 
      flex 
      gap-8 
      items-center
      overflow-hidden
      z-40
    ">
      {/* Replace images with real content later */}
      <div className="flex gap-8">
        <img src="/images/1.jpg" className="w-48 h-32 object-cover rounded-xl" />
        <img src="/images/2.jpg" className="w-48 h-32 object-cover rounded-xl" />
        <img src="/images/3.jpg" className="w-48 h-32 object-cover rounded-xl" />
        <img src="/images/4.jpg" className="w-48 h-32 object-cover rounded-xl" />
      </div>
    </div>
  );
}
