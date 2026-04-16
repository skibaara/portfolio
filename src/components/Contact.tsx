import { motion } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';

const Contact = () => {
  return (
    <footer id="contact" className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Let's build the future <br/><span style={{ fontStyle: 'italic' }}>of learning together.</span></h2>
            <p style={{ margin: '0 auto var(--space-lg)' }}>
              Currently open to permanent opportunities and strategic freelance partnerships.
            </p>
            
            <a href="mailto:hello@skibaara.com" className="btn btn-outline" style={{ fontSize: '1.25rem', padding: '1.5rem 3rem' }}>
              <Mail size={24} /> hello@skibaara.com
            </a>
          </motion.div>
          
          <div style={{ 
            marginTop: 'var(--space-xxl)', 
            paddingTop: 'var(--space-md)', 
            borderTop: '1px solid var(--color-border)', 
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem'
          }}>
            <p>© 2026 Stephanie Kibaara. Nairobi, KE / Global.</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <a href="https://github.com/skibaara" target="_blank" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                GitHub <ArrowUpRight size={14} />
              </a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                LinkedIn <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
