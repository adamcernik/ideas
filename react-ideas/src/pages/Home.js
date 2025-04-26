import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Helper to get first name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'ideas'),
          where('authorUid', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const ideasData = [];
        querySnapshot.forEach((doc) => {
          ideasData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setIdeas(ideasData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setLoading(false);
      }
    };
    
    fetchIdeas();
  }, [currentUser]);

  const handleTagChange = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) return;
    
    try {
      // Create timestamp for proper date display
      const currentDate = Timestamp.now();
      
      const ideaData = {
        title,
        description,
        tags: selectedTags,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhotoURL: currentUser.photoURL || '',
        date: currentDate,
        likes: 0
      };
      
      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      
      setIdeas([
        {
          id: docRef.id,
          ...ideaData
        },
        ...ideas
      ]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding idea:', error);
    }
  };

  const handleDelete = async (id, e) => {
    // Stop event propagation to prevent navigation when clicking delete
    if (e) {
      e.stopPropagation();
    }
    
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteDoc(doc(db, 'ideas', id));
        setIdeas(ideas.filter(idea => idea.id !== id));
        setActiveMenu(null);
      } catch (error) {
        console.error('Error deleting idea:', error);
      }
    }
  };

  const handleIdeaClick = (id) => {
    navigate(`/idea/${id}`);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleDetailsClick = (id, e) => {
    e.stopPropagation();
    navigate(`/idea/${id}`);
    setActiveMenu(null);
  };

  // Format date properly
  const formatDate = (date) => {
    if (!date) return '';
    
    // Check if date is a Firestore Timestamp
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    
    // Handle date if it's seconds
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    
    // Fallback
    return new Date(date).toLocaleDateString();
  };

  // If user is not logged in, show welcome content
  if (!currentUser) {
    return (
      <div className="home">
        <div className="hero">
          <h1>Idea Exchange Platform</h1>
          <p>Share and collaborate on business ideas between UX Designer and Product Manager</p>
          
          <div className="cta-buttons">
            <a href="/login" className="btn btn-primary">Login</a>
            <a href="/register" className="btn btn-secondary">Register</a>
          </div>
        </div>
        
        <div className="features">
          <div className="feature">
            <h2>Share Ideas</h2>
            <p>Submit your business ideas and get feedback from the community.</p>
          </div>
          <div className="feature">
            <h2>Collaborate</h2>
            <p>Work together with other professionals to refine and improve ideas.</p>
          </div>
          <div className="feature">
            <h2>Find Inspiration</h2>
            <p>Browse existing ideas to spark your own creativity and innovation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ideas-home">
      <div className="ideas-header">
        <h1>My Ideas</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          Add New Idea
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading ideas...</div>
      ) : (
        <div className="ideas-list">
          {ideas.length === 0 ? (
            <div className="no-ideas">
              <p>You don't have any ideas yet. Click "Add New Idea" to get started!</p>
            </div>
          ) : (
            ideas.map((idea) => (
              <div 
                className="idea-card" 
                key={idea.id} 
                onClick={() => handleIdeaClick(idea.id)}
              >
                <div className="idea-header">
                  <h3>{idea.title}</h3>
                  <div className="idea-menu">
                    <span className="idea-author">{getFirstName(idea.authorName)}</span>
                    <button 
                      className="kebab-menu"
                      onClick={(e) => toggleMenu(idea.id, e)}
                    >
                      ⋮
                    </button>
                    {activeMenu === idea.id && (
                      <div className="menu-options active">
                        <button 
                          className="menu-option"
                          onClick={(e) => handleDetailsClick(idea.id, e)}
                        >
                          Details
                        </button>
                        <button 
                          className="menu-option delete"
                          onClick={(e) => handleDelete(idea.id, e)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="idea-description">{idea.description}</p>
                <div className="idea-footer">
                  <div className="idea-tags">
                    {idea.tags.map((tag) => (
                      <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="idea-date">
                    {formatDate(idea.date)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Add New Idea</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-selector">
                  <div className="tag-option">
                    <input
                      type="checkbox"
                      id="tag-tech"
                      checked={selectedTags.includes('tech')}
                      onChange={() => handleTagChange('tech')}
                    />
                    <label htmlFor="tag-tech" className="tag tag-tech">Tech</label>
                  </div>
                  <div className="tag-option">
                    <input
                      type="checkbox"
                      id="tag-sport"
                      checked={selectedTags.includes('sport')}
                      onChange={() => handleTagChange('sport')}
                    />
                    <label htmlFor="tag-sport" className="tag tag-sport">Sport</label>
                  </div>
                  <div className="tag-option">
                    <input
                      type="checkbox"
                      id="tag-ux"
                      checked={selectedTags.includes('ux')}
                      onChange={() => handleTagChange('ux')}
                    />
                    <label htmlFor="tag-ux" className="tag tag-ux">UX/UI</label>
                  </div>
                  <div className="tag-option">
                    <input
                      type="checkbox"
                      id="tag-saas"
                      checked={selectedTags.includes('saas')}
                      onChange={() => handleTagChange('saas')}
                    />
                    <label htmlFor="tag-saas" className="tag">SaaS</label>
                  </div>
                  <div className="tag-option">
                    <input
                      type="checkbox"
                      id="tag-app"
                      checked={selectedTags.includes('app')}
                      onChange={() => handleTagChange('app')}
                    />
                    <label htmlFor="tag-app" className="tag">Mobile App</label>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 