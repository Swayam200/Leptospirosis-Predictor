// frontend/src/components/AboutPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './about.css';
import abhinav from './img/ab.jpg';
import tanq from './img/me.jpg';
import vand from './img/vad.jpg';
import aand from './img/and.jpg';
import patil from './img/ma.jpg';
import panda from './img/sw.jpg';
const AboutPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Abhinav Nath',
      role: 'Team Member',
      image: abhinav
    },
    {
      id: 2,
      name: 'Swayam Prakash Panda',
      role: 'Team Member',
      image: panda
    },
    {
      id: 3,
      name: 'Madhuram S. Patil',
      role: 'Team Member',
      image: patil
    },
    {
      id: 4,
      name: 'Tanishq Panwar',
      role: 'Team Member',
      image: tanq
    },
    {
      id: 5,
      name: 'Vandit A. Pareekh',
      role: 'Team Member',
      image: vand
    },
    {
      id: 6,
      name: 'Aadvik Bannerjee',
      role: 'Team Member',
      image: aand
    },
       
  ];

  return (
    <div className="about-container">
      <section className="about-header">
        <h1>Our Team</h1>
        
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