import React from 'react';

interface MarkdownRendererProps {
  content: string;
  fontClass?: string;
}

export default function MarkdownRenderer({ content, fontClass }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let i = 0;
  let elementIdx = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Handle code block
    if (line.trim().startsWith('```')) {
      const language = line.trim().substring(3).trim();
      let codeContent = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent += lines[i] + '\n';
        i++;
      }
      elements.push(
        <pre key={`code-${elementIdx++}`} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 font-mono text-xs text-slate-700 my-4 overflow-x-auto shadow-sm">
          {language && <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">{language}</div>}
          <code>{codeContent.trim()}</code>
        </pre>
      );
      i++;
      continue;
    }

    // Handle standard headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elementIdx++}`} className="text-2xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">
          {parseInline(line.substring(2))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elementIdx++}`} className="text-xl font-semibold text-slate-800 mt-5 mb-3 tracking-tight border-b border-slate-100 pb-1">
          {parseInline(line.substring(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elementIdx++}`} className="text-lg font-semibold text-slate-800 mt-4 mb-2">
          {parseInline(line.substring(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Handle Table
    if (line.trim().startsWith('|')) {
      // Collect table lines
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(renderTable(tableLines, elementIdx++));
      continue;
    }

    // Handle lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim())) {
      const isOrdered = /^\d+\.\s/.test(line.trim());
      const listItems: string[] = [];
      
      while (i < lines.length && (
        lines[i].trim().startsWith('- ') || 
        lines[i].trim().startsWith('* ') || 
        /^\d+\.\s/.test(lines[i].trim())
      )) {
        // Strip the marker
        let cleanText = lines[i].trim();
        if (cleanText.startsWith('- ') || cleanText.startsWith('* ')) {
          cleanText = cleanText.substring(2);
        } else {
          cleanText = cleanText.replace(/^\d+\.\s/, '');
        }
        listItems.push(cleanText);
        i++;
      }

      const ListTag = isOrdered ? 'ol' : 'ul';
      const listId = elementIdx++;
      elements.push(
        <ListTag 
          key={`list-${listId}`} 
          className={`pl-5 mb-4 space-y-1.5 text-slate-600 text-sm ${isOrdered ? 'list-decimal' : 'list-disc'}`}
        >
          {listItems.map((item, idx) => (
            <li key={`li-${listId}-${idx}`} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Handle horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(<hr key={`hr-${elementIdx++}`} className="my-6 border-slate-100" />);
      i++;
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Default: Paragraph
    elements.push(
      <p key={`p-${elementIdx++}`} className="text-slate-600 leading-relaxed mb-4 text-sm">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className={`markdown-body select-text ${fontClass || 'font-sans'}`}>{elements}</div>;
}

// Inline Markdown parsing (bold, italics, inline code)
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    // Check for bold (e.g., **text**)
    const boldMatch = remaining.match(/^([^\*]*)\*\*([^\*]+)\*\*(.*)$/);
    // Check for code (e.g., `code`)
    const codeMatch = remaining.match(/^([^`]*)`([^`]+)`(.*)$/);
    // Check for italic (e.g., *text*)
    const italicMatch = remaining.match(/^([^\*]*)\*([^\*]+)\*(.*)$/);

    // Prioritize the match that appears first
    const matches = [
      boldMatch ? { type: 'bold', index: boldMatch[1].length, match: boldMatch } : null,
      codeMatch ? { type: 'code', index: codeMatch[1].length, match: codeMatch } : null,
      italicMatch ? { type: 'italic', index: italicMatch[1].length, match: italicMatch } : null,
    ].filter(m => m !== null) as Array<{ type: string; index: number; match: RegExpMatchArray }>;

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    // Sort by order of occurrence
    matches.sort((a, b) => a.index - b.index);
    const first = matches[0];

    if (first.type === 'bold') {
      const [, pre, content, post] = first.match;
      if (pre) parts.push(pre);
      parts.push(<strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900">{content}</strong>);
      remaining = post;
    } else if (first.type === 'code') {
      const [, pre, content, post] = first.match;
      if (pre) parts.push(pre);
      parts.push(<code key={`code-${keyIdx++}`} className="px-1.5 py-0.5 bg-slate-50 border border-slate-200/50 rounded font-mono text-xs text-rose-600 font-medium">{content}</code>);
      remaining = post;
    } else if (first.type === 'italic') {
      const [, pre, content, post] = first.match;
      if (pre) parts.push(pre);
      parts.push(<em key={`i-${keyIdx++}`} className="italic text-slate-800">{content}</em>);
      remaining = post;
    }
  }

  return parts.length > 0 ? parts : [text];
}

// Render clean markdown tables
function renderTable(tableLines: string[], indexKey: number) {
  // Parse rows
  const parsedRows = tableLines.map(line => {
    // Split by pipe and remove leading/trailing empty elements from splitting
    const cells = line.split('|').map(c => c.trim());
    if (cells[0] === '') cells.shift();
    if (cells[cells.length - 1] === '') cells.pop();
    return cells;
  });

  // Filter out divider lines (like |---|---| or | :--- | :---: |)
  const rows = parsedRows.filter(row => {
    return !row.every(cell => /^[:-|-]+$/.test(cell));
  });

  if (rows.length === 0) return null;

  const headers = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div key={`table-wrapper-${indexKey}`} className="w-full my-4 overflow-x-auto border border-slate-200/60 rounded-xl shadow-sm bg-slate-900">
      <table className="w-full border-collapse text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
