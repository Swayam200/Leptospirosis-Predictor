// frontend/src/components/AboutPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './about.css';

const AboutPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Abhinav Nath',
      role: 'Team Member',
      bio: 'Pura Website banaya he madachodo',
      image: 'C:/Leptospirosis_app/frontend/src/components/team/Abhinav_Nath.jpg'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Data Science Lead',
      bio: 'PhD in Biostatistics, specializing in predictive disease modeling',
      image: '/team/michael-rodriguez.jpg'
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'GIS Specialist',
      bio: 'MSc in Geospatial Analysis, disease mapping expert',
      image: '/team/priya-patel.jpg'
    },
    {
      id: 4,
      name: 'James Kim',
      role: 'Frontend Developer',
      bio: 'Specializing in health data visualization interfaces',
      image: '/team/james-kim.jpg'
    }
  ];

  return (
    <div className="about-container">
      <section className="about-header">
        <h1>Our Expert Team</h1>
        <p>Combining medical expertise with advanced data analysis to combat infectious diseases</p>
      </section>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <article key={member.id} className="team-card">
            <div className="card-image">
              <img src={member.image} alt={member.name} />
            </div>
            <div className="card-content">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="bio">{member.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;