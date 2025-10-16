// frontend/src/pages/DashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import styles from './DashboardPage.module.css';

// Fake data to simulate fetching from the backend
const fakeTemplates = [
  { id: 1, name: 'Monthly Business Review' },
  { id: 2, name: 'Project Kickoff Deck' },
  { id: 3, name: 'Sales Quarterly Report' },
];

function DashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Templates</h1>
        <Link to="/upload" className={styles.uploadButton}>
          + Upload New Template
        </Link>
      </header>

      <div className={styles.grid}>
        {fakeTemplates.map((template) => (
          <TemplateCard key={template.id} id={template.id} name={template.name} />
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;