import Card from '../common/Card';

/**
 * Responsive Youtube/Vimeo media embed component.
 */
export default function VideoEmbed({
  src,
  title = 'Video Embed',
  aspectRatio = '16/9',
  className = '',
}) {
  // Convert standard watch links to embed links if applicable
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(src);

  return (
    <Card hoverEffect={false} padding="none" className={`overflow-hidden border border-[var(--border-color)] rounded-xl bg-black ${className}`}>
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio }}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        />
      </div>
    </Card>
  );
}
