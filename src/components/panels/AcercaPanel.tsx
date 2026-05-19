export default function AcercaPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Acerca del Autor</h2>
      </div>
      
      <div className="author-card">
        <div className="author-header">
          <div className="author-avatar-large">
            <span className="avatar-icon">🏭</span>
          </div>
          <div className="author-badge">
            <span className="badge-verified">✓ Verificado</span>
          </div>
        </div>
        
        <div className="author-info">
          <h3 className="company-name">Estructuras Metálicas HcB</h3>
          <p className="author-title">Ing. Giovanni Correa</p>
          <p className="author-tagline">Ingeniero Civil - Especialista en Estructuras Metálicas</p>
        </div>

        <div className="author-stats">
          <div className="author-stat">
            <span className="stat-number">15+</span>
            <span className="stat-text">Años de Experiencia</span>
          </div>
          <div className="author-stat">
            <span className="stat-number">200+</span>
            <span className="stat-text">Proyectos Ejecutados</span>
          </div>
          <div className="author-stat">
            <span className="stat-number">100%</span>
            <span className="stat-text">Clientes Satisfechos</span>
          </div>
        </div>

        <div className="author-services">
          <h4>Especialidades</h4>
          <div className="service-tags">
            <span className="service-tag">Diseño Estructural</span>
            <span className="service-tag">Fabricación de Estructuras</span>
            <span className="service-tag">Montaje Industrial</span>
            <span className="service-tag">Ingeniería de Detalle</span>
            <span className="service-tag">Consultoría Técnica</span>
          </div>
        </div>

        <div className="author-contact">
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>giovanni@hcbestructuras.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📱</span>
            <span>+57 300 123 4567</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <span>Bogotá, Colombia</span>
          </div>
        </div>

        <div className="author-footer">
          <div className="social-links">
            <button className="social-btn">LinkedIn</button>
            <button className="social-btn">Instagram</button>
            <button className="social-btn">WhatsApp</button>
          </div>
          <p className="copyright">© 2026 Estructuras Metálicas HcB - Colombia. Todos los derechos reservados.</p>
        </div>
      </div>

      <div className="certifications">
        <h4>Certificaciones</h4>
        <div className="cert-grid">
          <div className="cert-item">
            <span className="cert-icon">🏆</span>
            <span>ISO 9001:2015</span>
          </div>
          <div className="cert-item">
            <span className="cert-icon">🔧</span>
            <span>AISC Certified</span>
          </div>
          <div className="cert-item">
            <span className="cert-icon">📋</span>
            <span>Colegio de Ingenieros</span>
          </div>
        </div>
      </div>
    </div>
  )
}