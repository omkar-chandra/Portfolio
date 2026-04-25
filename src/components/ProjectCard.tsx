import React, { FC, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { isVerticalVideo } from '../data';

interface Props {
  project: Project;
  index: number;
}

const ProjectCard: FC<Props> = ({ project, index }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const vertical = isVerticalVideo(project);
  const isVideo = project.category === 'video';

  let aspectClass = 'project-card--poster';
  if (project.category === 'logo') aspectClass = 'project-card--logo';
  else if (isVideo) {
    aspectClass = vertical ? 'project-card--video-vertical' : 'project-card--video-horizontal';
  }

  const displayImage = isVideo ? project.thumbnail : project.image;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      className={`project-card ${aspectClass} ${isVideo ? 'project-card--is-video' : ''}`}
      onClick={() => navigate('/portfolio', { state: { projectId: project.id } })}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      data-cursor="View"
      style={{ '--card-glow': project.color1 } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-card__media-wrap">
        {displayImage && (
          <img
            src={displayImage}
            alt={project.title}
            className="project-card__img"
            style={{ opacity: isVideo && isHovered ? 0 : 1 }}
          />
        )}
        {isVideo && project.video && (
          <video
            ref={videoRef}
            className="project-card__hover-video"
            src={project.video}
            muted
            loop
            playsInline
            preload="none"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        )}
      </div>
      <div className="project-card__content">
        <h3 className="project-card__title">{project.title}</h3>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
