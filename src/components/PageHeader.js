// Eyebrow + big serif page title + optional one-line description.
function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}

export default PageHeader;
