export default function Book({
  children,
  isOpening = false,
  color = '#17105F',
  width = 292
}) {
  return (
    <div
      className={`recap-closed-book ${isOpening ? 'is-opening' : ''}`}
      style={{ '--book-color': color, '--book-width': `${width}px` }}
    >
      <div className="recap-closed-book__body">
        <div className="recap-closed-book__glow" aria-hidden="true" />
        <div className="recap-closed-book__burst" aria-hidden="true" />
        <div className="recap-closed-book__back" aria-hidden="true" />

        <div className="recap-closed-book__inner-spread" aria-hidden="true">
          <div className="recap-closed-book__inner-page recap-closed-book__inner-page--left">
            <span>INTANIUM</span>
            <strong>Recap<br />Nur Intan</strong>
            <small>Editorial Archive · 2026</small>
          </div>

          <div className="recap-closed-book__inner-page recap-closed-book__inner-page--right">
            <span>Chapter 01</span>
            <strong>Januari<br />2026</strong>
            <small>A Bright New Chapter</small>
          </div>
        </div>

        <div className="recap-closed-book__pages" aria-hidden="true" />

        <div className="recap-closed-book__cover">
          <div className="recap-closed-book__cover-face recap-closed-book__cover-face--front">
            {children}
          </div>
          <div className="recap-closed-book__cover-face recap-closed-book__cover-face--back">
            INTANIUM
          </div>
        </div>
      </div>
    </div>
  );
}
