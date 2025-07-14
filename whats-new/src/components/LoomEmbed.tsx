interface LoomEmbedProps {
  videoId: string;
  className?: string;
}

export const LoomEmbed = ({ videoId, className = "" }: LoomEmbedProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.loom.com/embed/${videoId}?sid=1`}
          frameBorder="0"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-subtle"
          title="Release walkthrough video"
        />
      </div>
    </div>
  );
};