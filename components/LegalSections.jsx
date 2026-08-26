import styles from "../styles/Legal.module.css";

// ── Body parser ──────────────────────────────────────────────────
// Sections are stored as plain-text template literals: blank lines
// separate paragraphs, and any line starting with "• " is rendered
// as a bullet list item. Keeps the content data files easy to write
// and edit without hand-crafting JSX for every paragraph/list.
function renderBody(body) {
  const blocks = body.trim().split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const isList = lines.length > 0 && lines.every((l) => l.startsWith("• "));
    if (isList) {
      return (
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j}>{l.replace(/^•\s*/, "")}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{lines.join(" ")}</p>;
  });
}

export default function LegalSections({ sections }) {
  return (
    <>
      {sections.map((s, i) =>
        s.sub ? (
          <div className={styles.subSection} key={i}>
            <h3>{s.title}</h3>
            {renderBody(s.body)}
          </div>
        ) : (
          <div className={styles.section} key={i}>
            <h2>{s.title}</h2>
            {renderBody(s.body)}
          </div>
        )
      )}
    </>
  );
}
