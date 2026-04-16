import { motion } from 'framer-motion';
import { 
  PenTool, 
  Layers, 
  Code, 
  Layout, 
  Target, 
  BookOpen, 
  Smartphone, 
  CheckCircle2 
} from 'lucide-react';

const About = () => {
  const toolkit = [
    { icon: <PenTool size={18} />, name: 'Articulate Storyline 360' },
    { icon: <Layers size={18} />, name: 'Articulate Rise' },
    { icon: <Layout size={18} />, name: 'Adobe Creative Suite' },
    { icon: <Code size={18} />, name: 'React / Vite / CSS' },
  ];

  const expertise = [
    { icon: <BookOpen size={18} />, name: 'Instructional Design' },
    { icon: <Target size={18} />, name: 'Product Management' },
    { icon: <Smartphone size={18} />, name: 'UX for Learning' },
    { icon: <CheckCircle2 size={18} />, name: 'SCORM/xAPI Compliance' },
  ];

  return (
    <section id="about" className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-lg)' }}>
          <div style={{ gridColumn: '1 / span 5' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span style={{ 
                color: 'var(--color-accent)', 
                fontWeight: 600, 
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
              <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-main)', fontSize: '1.25rem', lineHeight: '1.4' }}>
                I am Stephanie Kibaara, a Product Manager and eLearning Developer with a passion for creating educational tools that feel as good as they function. 
              </p>
              <p style={{ marginBottom: 'var(--space-lg)' }}>
                My approach combines rigorous instructional design principles with modern web development and product strategy. I don't just build courses; I architect learning pathways that ensure measurable behavioral changes.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-sm)', color: 'var(--color-accent)', fontWeight: 700 }}>Core Toolkit</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {toolkit.map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-text-main)' }}>
                        <span style={{ color: 'var(--color-accent)', opacity: 0.8 }}>{item.icon}</span>
                        <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 'var(--space-sm)', color: 'var(--color-accent)', fontWeight: 700 }}>Expertise</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {expertise.map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-text-main)' }}>
                        <span style={{ color: 'var(--color-accent)', opacity: 0.8 }}>{item.icon}</span>
                        <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                      </div>
                    ))}
                  </div>
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
