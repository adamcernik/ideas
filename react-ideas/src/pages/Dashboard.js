import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeas = async () => {
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
  }, [currentUser.uid]);

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
      const ideaData = {
        title,
        description,
        tags: selectedTags,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhotoURL: currentUser.photoURL || '',
        date: new Date(),
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
      } catch (error) {
        console.error('Error deleting idea:', error);
      }
    }
  };

  const handleIdeaClick = (id) => {
    navigate(`/idea/${id}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
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
                  <button 
                    className="btn-delete"
                    onClick={(e) => handleDelete(idea.id, e)}
                  >
                    Delete
                  </button>
                </div>
                <p className="idea-description">{idea.description}</p>
                <div className="idea-footer">
                  <div className="idea-tags">
                    {idea.tags.map((tag) => (
                      <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="idea-date">
                    {new Date(idea.date.seconds * 1000).toLocaleDateString()}
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

export default Dashboard; 