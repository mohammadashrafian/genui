export type DemoComponentName =
  | 'AlertBanner'
  | 'MetricBoard'
  | 'ChecklistPanel'
  | 'ComparisonTable'
  | 'TimelinePanel'
  | 'ActionPanel';

export interface AlertBannerProps {
  readonly title: string;
  readonly description: string;
  readonly tone?: 'info' | 'success' | 'warning';
}

export interface MetricBoardItem {
  readonly label: string;
  readonly value: string;
  readonly change?: string;
  readonly trend?: 'up' | 'down' | 'flat';
}

export interface MetricBoardProps {
  readonly title: string;
  readonly caption?: string;
  readonly items: readonly MetricBoardItem[];
}

export interface ChecklistItem {
  readonly label: string;
  readonly detail?: string;
  readonly status?: 'todo' | 'doing' | 'done';
}

export interface ChecklistPanelProps {
  readonly title: string;
  readonly intro?: string;
  readonly items: readonly ChecklistItem[];
}

export interface ComparisonRow {
  readonly label: string;
  readonly values: readonly string[];
}

export interface ComparisonTableProps {
  readonly title: string;
  readonly columns: readonly string[];
  readonly rows: readonly ComparisonRow[];
}

export interface TimelineItem {
  readonly title: string;
  readonly detail: string;
  readonly time?: string;
  readonly status?: 'done' | 'active' | 'next';
}

export interface TimelinePanelProps {
  readonly title: string;
  readonly items: readonly TimelineItem[];
}

export interface ActionPanelAction {
  readonly label: string;
  readonly description?: string;
  readonly href?: string;
  readonly emphasis?: 'primary' | 'secondary';
}

export interface ActionPanelProps {
  readonly title: string;
  readonly description: string;
  readonly actions: readonly ActionPanelAction[];
}

type DemoComponentCatalogEntry = {
  readonly name: DemoComponentName;
  readonly description: string;
  // Runtime registration controls the prop shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: (props: any) => JSX.Element;
};

export function AlertBanner(props: AlertBannerProps) {
  const tone = props.tone ?? 'info';

  return (
    <section className={`demo-card demo-alert demo-alert-${tone}`}>
      <div className="demo-alert-kicker">{tone}</div>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </section>
  );
}

export function MetricBoard(props: MetricBoardProps) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          {props.caption && <p>{props.caption}</p>}
        </div>
      </div>
      <div className="demo-metric-grid">
        {props.items.map((item) => (
          <article key={`${item.label}-${item.value}`} className="demo-metric">
            <span className="demo-metric-label">{item.label}</span>
            <strong className="demo-metric-value">{item.value}</strong>
            {(item.change || item.trend) && (
              <span className={`demo-metric-trend demo-metric-trend-${item.trend ?? 'flat'}`}>
                {item.change ?? item.trend}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ChecklistPanel(props: ChecklistPanelProps) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          {props.intro && <p>{props.intro}</p>}
        </div>
      </div>
      <ul className="demo-checklist">
        {props.items.map((item) => {
          const status = item.status ?? 'todo';

          return (
            <li
              key={`${item.label}-${status}`}
              className={`demo-check demo-check-${status}`}
            >
              <span className="demo-check-dot" aria-hidden="true" />
              <div>
                <strong>{item.label}</strong>
                {item.detail && <p>{item.detail}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ComparisonTable(props: ComparisonTableProps) {
  return (
    <section className="demo-card demo-table-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          <p>Compact comparison generated from the live model response.</p>
        </div>
      </div>
      <div className="demo-table-wrap">
        <table className="demo-table">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              {props.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {props.columns.map((column, index) => (
                  <td key={`${row.label}-${column}`}>{row.values[index] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TimelinePanel(props: TimelinePanelProps) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          <p>Useful for launch plans, onboarding steps, and execution sequences.</p>
        </div>
      </div>
      <ol className="demo-timeline">
        {props.items.map((item) => {
          const status = item.status ?? 'next';

          return (
            <li
              key={`${item.title}-${item.time ?? 'slot'}`}
              className={`demo-timeline-item demo-timeline-item-${status}`}
            >
              <div className="demo-timeline-pin" aria-hidden="true" />
              <div className="demo-timeline-content">
                <div className="demo-timeline-topline">
                  <strong>{item.title}</strong>
                  {item.time && <span>{item.time}</span>}
                </div>
                <p>{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ActionPanel(props: ActionPanelProps) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          <p>{props.description}</p>
        </div>
      </div>
      <div className="demo-action-grid">
        {props.actions.map((action) => {
          const emphasis = action.emphasis ?? 'secondary';

          return (
            <article
              key={`${action.label}-${action.href ?? 'local'}`}
              className={`demo-action demo-action-${emphasis}`}
            >
              <strong>{action.label}</strong>
              {action.description && <p>{action.description}</p>}
              {action.href && (
                <a href={action.href} target="_blank" rel="noreferrer">
                  Open link
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const demoComponentCatalog = [
  {
    name: 'AlertBanner',
    description: 'Use for warnings, highlights, or concise status callouts.',
    component: AlertBanner,
  },
  {
    name: 'MetricBoard',
    description: 'Use when the answer is best shown as 2 to 6 headline metrics.',
    component: MetricBoard,
  },
  {
    name: 'ChecklistPanel',
    description: 'Use for plans, TODOs, launch checklists, or prioritized execution steps.',
    component: ChecklistPanel,
  },
  {
    name: 'ComparisonTable',
    description: 'Use when comparing a few options across consistent columns.',
    component: ComparisonTable,
  },
  {
    name: 'TimelinePanel',
    description: 'Use for sequences, phased roadmaps, or chronological steps.',
    component: TimelinePanel,
  },
  {
    name: 'ActionPanel',
    description: 'Use for recommended next actions, links, or tactical follow-ups.',
    component: ActionPanel,
  },
] as const satisfies readonly DemoComponentCatalogEntry[];

export const demoComponentNames = demoComponentCatalog.map((definition) => definition.name);
