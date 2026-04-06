import { z } from 'zod';

// ─── Schemas ───────────────────────────────────────────────

export const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
  disabled: z.boolean().default(false),
});

export const cardSchema = z.object({
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().url().optional(),
});

export const alertSchema = z.object({
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
  dismissible: z.boolean().default(true),
});

export const statSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
});

// ─── Components ────────────────────────────────────────────

export function Button({ label, variant, disabled }: z.infer<typeof buttonSchema>) {
  return <button className={`btn btn-${variant}`} disabled={disabled}>{label}</button>;
}

export function Card({ title, body, imageUrl }: z.infer<typeof cardSchema>) {
  return (
    <div className="card">
      {imageUrl && <img src={imageUrl} alt={title} />}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function Alert({ message, severity, dismissible }: z.infer<typeof alertSchema>) {
  return (
    <div className={`alert alert-${severity}`} role="alert">
      <span>{message}</span>
      {dismissible && <button aria-label="Dismiss">×</button>}
    </div>
  );
}

export function Stat({ label, value, unit, trend }: z.infer<typeof statSchema>) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}{unit && ` ${unit}`} {arrow}</span>
    </div>
  );
}
