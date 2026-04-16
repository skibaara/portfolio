import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', paddingTop: 'var(--header-height)' }}>
      <div className="container">
        <div style={{ maxWidth: '800px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span style={{ 
              color: 'var(--color-accent)', 
              fontWeight: 500, 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              display: 'block',
              marginBottom: 'var(--space-sm)'
            }}>
              eLearning Developer & Product Manager
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 'var(--space-md)' }}
          >
            Architecting <span style={{ fontStyle: 'italic' }}>Learning</span> Experiences that Drive Impact.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ marginBottom: 'var(--space-lg)', fontSize: '1.25rem' }}
          >
            I specialize in designing and developing interactive, high-retention digital learning solutions. Based in Nairobi, working globally.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{ display: 'flex', gap: 'var(--space-md)' }}
          >
            <a href="#work" className="btn">View Case Studies</a>
            <a href="#contact" className="btn btn-outline">Get in Touch</a>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative background element */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
    </section>
  );
};

export default Hero;
