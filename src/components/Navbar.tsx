import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 'var(--header-height)', 
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <a href="#" style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: 'var(--color-text-main)',
          textDecoration: 'none'
        }}>
          S. Kibaara
        </a>
        
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          {['Work', 'About', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-main)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
