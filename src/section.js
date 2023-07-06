function Section({ role = 'primary', header = null, children }) {
    const SECTION_CONTAINER = {
        margin: '10px auto 10px auto',
        backgroundColor: `var(--bs-${role}-bg-subtle)`
    };

    return <div className='card' style={SECTION_CONTAINER}>
        {(header && <div className='card-header'>{header}</div>)}
        
        <div className='card-body'>
        {children}
        </div>
    </div>
}

function InfoSection({ headerText, altText, icon = null}) {
    return <Section role='tertiary' header={headerText}>
      {icon && <div className="spinner-border" role="status">
        <span className="visually-hidden">{altText}</span>
      </div>}
    </Section>
  }

export { Section, InfoSection };