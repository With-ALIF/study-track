export default function PageSection({ title, actions, children }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}
