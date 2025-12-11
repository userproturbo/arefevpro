export default function HomeGallery() {
  return (
    <div className="
      fixed bottom-0 left-14 right-0
      px-12 py-10
      bg-black/20 backdrop-blur-xl
      flex gap-10
      items-center
      z-20
    ">
      <img src="/images/1.jpg" className="w-52 h-36 object-cover rounded-xl" />
      <img src="/images/2.jpg" className="w-52 h-36 object-cover rounded-xl" />
      <img src="/images/3.jpg" className="w-52 h-36 object-cover rounded-xl" />
      <img src="/images/4.jpg" className="w-52 h-36 object-cover rounded-xl" />
    </div>
  );
}
