import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface ProjectProps {
  title: string;
  category: string;
  description: string;
  path: string;
  tags: string[];
  gradient: string;
}

const ProjectCard = ({ title, category, description, path, tags, gradient }: ProjectProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '0px', // Flat editorial look
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ 
        height: '240px', 
        background: gradient, 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Abstract pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <ExternalLink size={48} color="white" />
        </motion.div>
      </div>

      <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ 
          color: 'var(--color-accent)', 
          fontSize: '0.75rem', 
          fontWeight: 600, 
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 'var(--space-xs)',
          display: 'block'
        }}>
          {category}
        </span>
        
        <h3 style={{ marginBottom: 'var(--space-xs)', color: 'var(--color-text-main)' }}>{title}</h3>
        
        <p style={{ 
          fontSize: '0.95rem', 
          marginBottom: 'var(--space-md)', 
          color: 'var(--color-text-muted)',
          flex: 1
        }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.7rem',
              padding: '4px 8px',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              color: 'var(--color-text-muted)'
            }}>
              {tag}
            </span>
          ))}
        </div>

        <a 
          href={path} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Launch Course <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
