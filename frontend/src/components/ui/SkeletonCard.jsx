const SkeletonCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-neutral-200 aspect-[3/4] w-full mb-4"></div>
      <div className="h-4 bg-neutral-200 w-1/3 mb-2"></div>
      <div className="h-5 bg-neutral-200 w-2/3 mb-2"></div>
      <div className="h-4 bg-neutral-200 w-1/4"></div>
    </div>
  )
}

export default SkeletonCard
