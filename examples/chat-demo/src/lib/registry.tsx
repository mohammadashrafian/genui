import { ComponentRegistry, safeString, safeUrl } from '@genuikit/core';
import { z } from 'zod';

type DemoComponentDefinition = {
  readonly name: string;
  readonly description: string;
  readonly schema: z.ZodTypeAny;
  // Runtime schema validation makes this safe for the shared catalog.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: (props: any) => JSX.Element;
};

const badgeToneSchema = z.enum(['info', 'success', 'warning']);

const alertBannerSchema = z.object({
  title: safeString({ maxLength: 120 }),
  description: safeString({ maxLength: 400 }),
  tone: badgeToneSchema.default('info'),
});

const metricBoardSchema = z.object({
  title: safeString({ maxLength: 120 }),
  caption: safeString({ maxLength: 240 }).optional(),
  items: z
    .array(
      z.object({
        label: safeString({ maxLength: 80 }),
        value: safeString({ maxLength: 120 }),
        change: safeString({ maxLength: 40 }).optional(),
        trend: z.enum(['up', 'down', 'flat']).optional(),
      }),
    )
    .min(2)
    .max(6),
});

const checklistPanelSchema = z.object({
  title: safeString({ maxLength: 120 }),
  intro: safeString({ maxLength: 240 }).optional(),
  items: z
    .array(
      z.object({
        label: safeString({ maxLength: 140 }),
        detail: safeString({ maxLength: 220 }).optional(),
        status: z.enum(['todo', 'doing', 'done']).default('todo'),
      }),
    )
    .min(1)
    .max(7),
});

const comparisonTableSchema = z.object({
  title: safeString({ maxLength: 120 }),
  columns: z
    .array(safeString({ maxLength: 80 }))
    .min(2)
    .max(4),
  rows: z
    .array(
      z.object({
        label: safeString({ maxLength: 120 }),
        values: z
          .array(safeString({ maxLength: 160 }))
          .min(2)
          .max(4),
      }),
    )
    .min(1)
    .max(6),
});

const timelinePanelSchema = z.object({
  title: safeString({ maxLength: 120 }),
  items: z
    .array(
      z.object({
        title: safeString({ maxLength: 100 }),
        detail: safeString({ maxLength: 220 }),
        time: safeString({ maxLength: 80 }).optional(),
        status: z.enum(['done', 'active', 'next']).default('next'),
      }),
    )
    .min(2)
    .max(6),
});

const actionPanelSchema = z.object({
  title: safeString({ maxLength: 120 }),
  description: safeString({ maxLength: 280 }),
  actions: z
    .array(
      z.object({
        label: safeString({ maxLength: 100 }),
        description: safeString({ maxLength: 220 }).optional(),
        href: safeUrl().optional(),
        emphasis: z.enum(['primary', 'secondary']).default('secondary'),
      }),
    )
    .min(1)
    .max(4),
});

function AlertBanner(props: z.infer<typeof alertBannerSchema>) {
  return (
    <section className={`demo-card demo-alert demo-alert-${props.tone}`}>
      <div className="demo-alert-kicker">{props.tone}</div>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </section>
  );
}

function MetricBoard(props: z.infer<typeof metricBoardSchema>) {
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

function ChecklistPanel(props: z.infer<typeof checklistPanelSchema>) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          {props.intro && <p>{props.intro}</p>}
        </div>
      </div>
      <ul className="demo-checklist">
        {props.items.map((item) => (
          <li
            key={`${item.label}-${item.status}`}
            className={`demo-check demo-check-${item.status}`}
          >
            <span className="demo-check-dot" aria-hidden="true" />
            <div>
              <strong>{item.label}</strong>
              {item.detail && <p>{item.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ComparisonTable(props: z.infer<typeof comparisonTableSchema>) {
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

function TimelinePanel(props: z.infer<typeof timelinePanelSchema>) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          <p>Useful for launch plans, onboarding steps, and execution sequences.</p>
        </div>
      </div>
      <ol className="demo-timeline">
        {props.items.map((item) => (
          <li
            key={`${item.title}-${item.time ?? 'slot'}`}
            className={`demo-timeline-item demo-timeline-item-${item.status}`}
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
        ))}
      </ol>
    </section>
  );
}

function ActionPanel(props: z.infer<typeof actionPanelSchema>) {
  return (
    <section className="demo-card">
      <div className="demo-section-header">
        <div>
          <h3>{props.title}</h3>
          <p>{props.description}</p>
        </div>
      </div>
      <div className="demo-action-grid">
        {props.actions.map((action) => (
          <article
            key={`${action.label}-${action.href ?? 'local'}`}
            className={`demo-action demo-action-${action.emphasis}`}
          >
            <strong>{action.label}</strong>
            {action.description && <p>{action.description}</p>}
            {action.href && (
              <a href={action.href} target="_blank" rel="noreferrer">
                Open link
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

const componentDefinitions = [
  {
    name: 'AlertBanner',
    description: 'Use for warnings, highlights, or concise status callouts.',
    schema: alertBannerSchema,
    component: AlertBanner,
  },
  {
    name: 'MetricBoard',
    description: 'Use when the answer is best shown as 2 to 6 headline metrics.',
    schema: metricBoardSchema,
    component: MetricBoard,
  },
  {
    name: 'ChecklistPanel',
    description: 'Use for plans, TODOs, launch checklists, or prioritized execution steps.',
    schema: checklistPanelSchema,
    component: ChecklistPanel,
  },
  {
    name: 'ComparisonTable',
    description: 'Use when comparing a few options across consistent columns.',
    schema: comparisonTableSchema,
    component: ComparisonTable,
  },
  {
    name: 'TimelinePanel',
    description: 'Use for sequences, phased roadmaps, or chronological steps.',
    schema: timelinePanelSchema,
    component: TimelinePanel,
  },
  {
    name: 'ActionPanel',
    description: 'Use for recommended next actions, links, or tactical follow-ups.',
    schema: actionPanelSchema,
    component: ActionPanel,
  },
] as const satisfies readonly DemoComponentDefinition[];

function createRegistry() {
  const registry = new ComponentRegistry();

  for (const definition of componentDefinitions) {
    registry.register(definition.name, definition.schema, definition.component);
  }

  return registry;
}

export const demoRegistry = createRegistry();

const schemaMap = new Map(
  demoRegistry.toToolDefinition().map((definition) => [definition.name, definition.schema]),
);

export const demoToolDefinitions = componentDefinitions.map((definition) => ({
  name: definition.name,
  description: definition.description,
  schema: schemaMap.get(definition.name) ?? {},
}));

export const demoComponentNames = componentDefinitions.map((definition) => definition.name);
