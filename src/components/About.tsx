import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-md)' }}>
          <div style={{ gridColumn: '1 / span 5' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span style={{ 
                color: 'var(--color-accent)', 
                fontWeight: 500, 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                marginBottom: 'var(--space-xs)',
                display: 'block'
              }}>
                The Philosophy
              </span>
              <h2>Bridging the gap between knowledge and retention.</h2>
            </motion.div>
          </div>
          
          <div style={{ gridColumn: '7 / span 6' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-main)' }}>
                I am Stephanie Kibaara, a Product Manager and eLearning Developer with a passion for creating educational tools that feel as good as they function. 
              </p>
              <p style={{ marginBottom: 'var(--space-md)' }}>
                My approach combines rigorous instructional design principles with modern web development and product strategy. I don't just build courses; I architect learning pathways that ensure measurable behavioral changes.
              </p>
              
              <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', color: 'var(--color-accent)' }}>Core Toolkit</h4>
                  <ul style={{ listStyle: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    <li>Articulate Storyline 360</li>
                    <li>Articulate Rise</li>
                    <li>Adobe Creative Suite</li>
                    <li>React / Vite / CSS</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', color: 'var(--color-accent)' }}>Expertise</h4>
                  <ul style={{ listStyle: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    <li>Instructional Design</li>
                    <li>Product Management</li>
                    <li>UX for Learning</li>
                    <li>SCORM/xAPI Compliance</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
