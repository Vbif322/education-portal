import React from "react";
import styles from "./style.module.css";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  color,
}: FeatureCardProps) {
  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <div className={styles.iconContainer}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
