import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import './Questions.css';

const Questions = () => {
  const { currentUser } = useAuth();

  // Function to load answers for a question
  const loadQuestionAnswers = async (questionId) => {
    try {
      console.log(`Loading answers for question ${questionId}`);
      const answersContainer = document.getElementById(`answers-${questionId}`);
      
      if (!answersContainer) {
        console.error(`Container for answers-${questionId} not found`);
        return;
      }
      
      // Clear previous content
      answersContainer.innerHTML = '';
      
      // Create new answers container
      const answersElement = document.createElement('div');
      answersElement.className = 'answer-items';
      answersContainer.appendChild(answersElement);
      
      // Get answers from Firestore
      const q = query(
        collection(db, 'questionAnswers'),
        where('questionId', '==', questionId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      let answersCount = 0;
      
      querySnapshot.forEach((doc) => {
        answersCount++;
        const answerData = doc.data();
        
        // Format date
        const date = answerData.date.toDate ? answerData.date.toDate() : new Date(answerData.date);
        const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
        
        // Create answer element
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-item';
        
        // Hide answers beyond the first 5
        if (answersCount > 5) {
          answerElement.style.display = 'none';
        }
        
        // Handle author photo
        const authorPhoto = answerData.authorPhotoURL || '';
        const authorPhotoHTML = authorPhoto
          ? `<img src="${authorPhoto}" class="answer-photo" alt="${answerData.authorName}">`
          : '';
        
        answerElement.innerHTML = `
          <div class="answer-header">
            ${authorPhotoHTML}
            <span class="answer-author">${answerData.authorName}</span>
            <span class="answer-date">${formattedDate}</span>
          </div>
          <div class="answer-text">${answerData.text}</div>
        `;
        
        answersElement.appendChild(answerElement);
      });
      
      // Add 'Show More' button if there are more than 5 answers
      if (answersCount > 5) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-answers';
        showMoreBtn.setAttribute('data-question', questionId);
        showMoreBtn.innerHTML = `
          <span>Show More</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
        `;
        
        // Add show more button after the answers
        answersContainer.appendChild(showMoreBtn);
      }
      
      // Show "No answers yet" message if there are no answers
      if (answersCount === 0) {
        const noAnswersMsg = document.createElement('p');
        noAnswersMsg.className = 'no-answers-msg';
        noAnswersMsg.textContent = 'No answers yet. Be the first to share your thoughts!';
        answersContainer.appendChild(noAnswersMsg);
      }
      
      // Make answers container visible
      answersContainer.style.display = 'block';
      
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  // Function to handle answer submission
  const submitQuestionAnswer = async (questionId, text) => {
    if (!currentUser) return Promise.reject('User not logged in');
    
    // Get user's first name
    let authorName = currentUser.displayName || currentUser.email || 'Anonymous User';
    // Extract first name if full name is available
    if (authorName.includes(' ')) {
      authorName = authorName.split(' ')[0];
    }
    
    // Create answer object
    const answer = {
      questionId: questionId,
      authorUid: currentUser.uid,
      authorName: authorName,
      authorPhotoURL: currentUser.photoURL || '',
      text: text,
      date: new Date()
    };
    
    // Save to Firestore
    return addDoc(collection(db, 'questionAnswers'), answer);
  };

  // Set up event handlers after component mounts
  useEffect(() => {
    // Load all answers for each question
    const loadAllQuestionAnswers = () => {
      if (!currentUser) return;
      
      const questions = document.querySelectorAll('.answer-btn');
      questions.forEach(question => {
        const questionId = question.getAttribute('data-question');
        loadQuestionAnswers(questionId);
      });
    };

    // Call immediately if user is logged in
    if (currentUser) {
      loadAllQuestionAnswers();
    }

    // Handle answer button clicks
    const handleAnswerButtonClick = (e) => {
      if (e.target.classList.contains('answer-btn')) {
        const questionId = e.target.getAttribute('data-question');
        const questionText = e.target.parentElement.textContent.trim().split('Answer')[0].trim();
        
        if (!currentUser) {
          alert('Please log in to answer questions.');
          return;
        }
        
        // Set up and show modal
        const answerModal = document.getElementById('answer-modal');
        const modalQuestionText = document.getElementById('answer-modal-question-text');
        const modalForm = document.getElementById('answer-modal-form');
        const modalTextarea = document.getElementById('answer-modal-textarea');
        
        modalQuestionText.textContent = questionText;
        modalTextarea.value = '';
        modalForm.setAttribute('data-question-id', questionId);
        
        answerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalTextarea.focus();
      }
    };

    // Handle show more/less answers
    const handleShowMoreLess = (e) => {
      if (e.target.closest('.show-more-answers')) {
        const showMoreBtn = e.target.closest('.show-more-answers');
        const questionId = showMoreBtn.getAttribute('data-question');
        const answersContainer = document.querySelector(`#answers-${questionId} .answer-items`);
        
        if (showMoreBtn.classList.contains('expanded')) {
          // Collapse to show only 5 answers
          showMoreBtn.classList.remove('expanded');
          showMoreBtn.querySelector('span').textContent = 'Show More';
          
          // Hide answers beyond the first 5
          const allAnswers = answersContainer.querySelectorAll('.answer-item');
          allAnswers.forEach((answer, index) => {
            if (index >= 5) {
              answer.style.display = 'none';
            }
          });
        } else {
          // Expand to show all answers
          showMoreBtn.classList.add('expanded');
          showMoreBtn.querySelector('span').textContent = 'Show Less';
          
          // Show all answers
          const allAnswers = answersContainer.querySelectorAll('.answer-item');
          allAnswers.forEach(answer => {
            answer.style.display = 'block';
          });
        }
      }
    };

    // Set up answer modal
    const setupAnswerModal = () => {
      const answerModal = document.getElementById('answer-modal');
      const modalClose = document.getElementById('answer-modal-close');
      const modalForm = document.getElementById('answer-modal-form');
      
      // Close modal when close button is clicked
      modalClose.addEventListener('click', () => {
        answerModal.classList.remove('active');
        document.body.style.overflow = '';
      });
      
      // Close modal when clicking outside content
      answerModal.addEventListener('click', (e) => {
        if (e.target === answerModal) {
          answerModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
      
      // Handle form submission
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentUser) {
          alert('Please log in to submit answers.');
          return;
        }
        
        const textarea = document.getElementById('answer-modal-textarea');
        const answerText = textarea.value.trim();
        
        if (!answerText) {
          alert('Please enter your answer before submitting.');
          return;
        }
        
        const questionId = modalForm.getAttribute('data-question-id');
        
        submitQuestionAnswer(questionId, answerText)
          .then(() => {
            answerModal.classList.remove('active');
            document.body.style.overflow = '';
            loadQuestionAnswers(questionId);
          })
          .catch(error => {
            console.error('Error submitting answer:', error);
            alert('Error submitting answer. Please try again.');
          });
      });
    };

    // Add event listeners
    document.addEventListener('click', handleAnswerButtonClick);
    document.addEventListener('click', handleShowMoreLess);
    setupAnswerModal();

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('click', handleAnswerButtonClick);
      document.removeEventListener('click', handleShowMoreLess);
    };
  }, [currentUser]);

  return (
    <div className="questions-page">
      <div className="motivation-container">
        <h2>Finding Viable Ideas</h2>
        <p>Use these questions to guide your ideation process and evaluate potential business opportunities.</p>
        
        <div className="question-category">
          <h3>Personal Alignment Questions</h3>
          <ul className="question-list">
            <li>
              What problems do I genuinely care about solving?
              <button className="answer-btn" data-question="personal1">Answer</button>
              <div className="question-answers" id="answers-personal1">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What unique skills, experiences, or insights do I have that others don't?
              <button className="answer-btn" data-question="personal2">Answer</button>
              <div className="question-answers" id="answers-personal2">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What could I work on for years without losing interest?
              <button className="answer-btn" data-question="personal3">Answer</button>
              <div className="question-answers" id="answers-personal3">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What areas do I have unfair advantages in (connections, expertise, resources)?
              <button className="answer-btn" data-question="personal4">Answer</button>
              <div className="question-answers" id="answers-personal4">
                {/* Answers will be loaded here */}
              </div>
            </li>
          </ul>
        </div>
        
        <div className="question-category">
          <h3>Market Reality Questions</h3>
          <ul className="question-list">
            <li>
              What pain points exist that people or businesses would pay to solve?
              <button className="answer-btn" data-question="market1">Answer</button>
              <div className="question-answers" id="answers-market1">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              Where are people currently spending money but unhappy with solutions?
              <button className="answer-btn" data-question="market2">Answer</button>
              <div className="question-answers" id="answers-market2">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What inefficient processes or systems could be dramatically improved?
              <button className="answer-btn" data-question="market3">Answer</button>
              <div className="question-answers" id="answers-market3">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What emerging trends or technologies create new opportunities?
              <button className="answer-btn" data-question="market4">Answer</button>
              <div className="question-answers" id="answers-market4">
                {/* Answers will be loaded here */}
              </div>
            </li>
          </ul>
        </div>
        
        <div className="question-category">
          <h3>Execution Questions</h3>
          <ul className="question-list">
            <li>
              Can I build a minimum viable product (MVP) relatively quickly?
              <button className="answer-btn" data-question="execution1">Answer</button>
              <div className="question-answers" id="answers-execution1">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              Do I have access to early users who can provide feedback?
              <button className="answer-btn" data-question="execution2">Answer</button>
              <div className="question-answers" id="answers-execution2">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What would sustainable unit economics look like?
              <button className="answer-btn" data-question="execution3">Answer</button>
              <div className="question-answers" id="answers-execution3">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              How could this idea scale?
              <button className="answer-btn" data-question="execution4">Answer</button>
              <div className="question-answers" id="answers-execution4">
                {/* Answers will be loaded here */}
              </div>
            </li>
          </ul>
        </div>
        
        <div className="question-category">
          <h3>Differentiation Questions</h3>
          <ul className="question-list">
            <li>
              Why hasn't this been solved effectively already?
              <button className="answer-btn" data-question="diff1">Answer</button>
              <div className="question-answers" id="answers-diff1">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What's my unique insight about this market or problem?
              <button className="answer-btn" data-question="diff2">Answer</button>
              <div className="question-answers" id="answers-diff2">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              How defensible would this solution be against competitors?
              <button className="answer-btn" data-question="diff3">Answer</button>
              <div className="question-answers" id="answers-diff3">
                {/* Answers will be loaded here */}
              </div>
            </li>
            <li>
              What would make customers choose this over alternatives?
              <button className="answer-btn" data-question="diff4">Answer</button>
              <div className="question-answers" id="answers-diff4">
                {/* Answers will be loaded here */}
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Answer Modal */}
      <div id="answer-modal" className="answer-modal">
        <div className="answer-modal-content">
          <button id="answer-modal-close" className="answer-modal-close">&times;</button>
          <h3 className="answer-modal-title" id="answer-modal-question-text">Question text will appear here</h3>
          <form id="answer-modal-form" className="answer-modal-form">
            <textarea id="answer-modal-textarea" className="answer-modal-textarea" placeholder="Share your thoughts..." required></textarea>
            <button type="submit" className="answer-modal-submit">Submit Answer</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questions; 