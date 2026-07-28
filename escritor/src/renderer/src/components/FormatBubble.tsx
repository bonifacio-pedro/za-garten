interface Props {
  top: number
  left: number
  onBold: () => void
  onItalic: () => void
  onCode: () => void
  onLink: () => void
  onH2: () => void
  onH3: () => void
  onList: () => void
  onQuote: () => void
}

export default function FormatBubble({
  top,
  left,
  onBold,
  onItalic,
  onCode,
  onLink,
  onH2,
  onH3,
  onList,
  onQuote
}: Props): React.JSX.Element {
  return (
    <div className="bubble" style={{ top, left }} onMouseDown={(e) => e.preventDefault()}>
      <button type="button" title="Negrito" onClick={onBold}>
        B
      </button>
      <button type="button" title="Itálico" onClick={onItalic}>
        <em>I</em>
      </button>
      <button type="button" title="Código" onClick={onCode}>
        {'</>'}
      </button>
      <button type="button" title="Link" onClick={onLink}>
        Link
      </button>
      <button type="button" title="Heading 2" onClick={onH2}>
        H2
      </button>
      <button type="button" title="Heading 3" onClick={onH3}>
        H3
      </button>
      <button type="button" title="Lista" onClick={onList}>
        List
      </button>
      <button type="button" title="Citação" onClick={onQuote}>
        Quote
      </button>
    </div>
  )
}
