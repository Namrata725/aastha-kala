export default function FloatingBlobs() {
  return (
    <>
      <div className="absolute top-[8%] left-[12%] w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-primary/35 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute top-[60%] left-[5%] w-36 sm:w-56 md:w-72 h-36 sm:h-56 md:h-72 bg-indigo-400/30 rounded-full blur-2xl animate-float-medium" />
      <div className="absolute bottom-[10%] right-[10%] w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-secondary/35 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute top-[30%] right-[20%] w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-pink-400/30 rounded-full blur-2xl animate-float-fast" />
    </>
  );
}
