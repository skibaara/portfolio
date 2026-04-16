import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { projects } from '../data/projects';

const PortfolioGrid = () => {
  return (
    <section id="work" className="section" style={{ background: 'linear-gradient(to bottom, var(--color-bg), #0a0a09)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 'var(--space-xl)' }}
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
            Selected Projects
          </span>
          <h2>Featured Case Studies</h2>
          <p>A collection of specialized e-learning projects demonstrating expertise in instructional design, pedagogical theory, and technical implementation.</p>
        </motion.div>

        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioGrid;
