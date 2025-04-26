import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './IdeaDetail.css';

const IdeaDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [brainstormContent, setBrainstormContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const autosaveTimeoutRef = useRef(null);

  // Fetch idea data
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const ideaDoc = await getDoc(doc(db, 'ideas', id));
        
        if (!ideaDoc.exists()) {
          setError('Idea not found');
          setLoading(false);
          return;
        }
        
        const ideaData = {
          id: ideaDoc.id,
          ...ideaDoc.data()
        };
        
        // Check if current user is the author
        if (ideaData.authorUid !== currentUser.uid) {
          setError('You do not have permission to view this idea');
          setLoading(false);
          return;
        }
        
        setIdea(ideaData);
        loadBrainstormContent(id);
      } catch (error) {
        console.error('Error fetching idea:', error);
        setError('Failed to load idea data');
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchIdea();
    }
  }, [id, currentUser]);

  // Load brainstorm content
  const loadBrainstormContent = async (ideaId) => {
    try {
      const brainstormRef = doc(db, 'brainstorms', `${currentUser.uid}_${ideaId}`);
      const brainstormSnap = await getDoc(brainstormRef);
      
      if (brainstormSnap.exists() && brainstormSnap.data().content) {
        setBrainstormContent(brainstormSnap.data().content);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading brainstorm content:', error);
      setLoading(false);
    }
  };

  // Handle brainstorm content change with autosave
  const handleBrainstormChange = (e) => {
    const newContent = e.target.value;
    setBrainstormContent(newContent);
    
    // Clear any existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    // Set a new timeout for autosave
    autosaveTimeoutRef.current = setTimeout(() => {
      saveBrainstormContent(id, newContent);
    }, 1000); // 1 second delay
  };

  // Save brainstorm content
  const saveBrainstormContent = async (ideaId, content) => {
    try {
      setSaveStatus('Saving...');
      
      const brainstormRef = doc(db, 'brainstorms', `${currentUser.uid}_${ideaId}`);
      await setDoc(brainstormRef, {
        userId: currentUser.uid,
        ideaId: ideaId,
        content: content,
        lastUpdated: new Date()
      });
      
      setSaveStatus('Saved');
      
      // Hide status after 2 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
    } catch (error) {
      console.error('Error saving brainstorm content:', error);
      setSaveStatus('Error saving');
    }
  };

  // Go back to dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="idea-detail-container">
        <div className="loading">Loading idea...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idea-detail-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="idea-detail-container">
      <div className="idea-detail-header">
        <button className="btn-back" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>{idea.title}</h1>
        <div className="idea-tags">
          {idea.tags.map((tag) => (
            <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="idea-content">
        <div className="idea-description">
          <h2>Description</h2>
          <p>{idea.description}</p>
        </div>
        
        <div className="idea-brainstorm">
          <h2>Brainstorm</h2>
          <p className="brainstorm-help">Use this space to freely brainstorm about your idea. Notes are saved automatically.</p>
          <div className="autosave-status-container">
            <span className={`autosave-status ${saveStatus ? 'visible' : ''}`}>
              {saveStatus}
            </span>
          </div>
          <textarea
            className="brainstorm-textarea"
            value={brainstormContent}
            onChange={handleBrainstormChange}
            placeholder="Add your thoughts, research notes, or anything else related to this idea..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail; 