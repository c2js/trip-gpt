import React, { useState, useEffect, useRef, useContext } from 'react';
import DataContext from '../DataContext';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

const Chatbot = () => {
  const { poi, setPOI } = useContext(DataContext);

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    inputRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!message) return;
    
    setLoading(true);
    setHistory(prevstate => [...prevstate, { role: 'user', content: message}]);
    
    console.log(JSON.stringify( { role: 'user', content: message} ));
    setMessage('');
    
    const response = await fetch(process.env.REACT_APP_BACKEND_ENDPOINT, {
      //mode: 'cors', 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(  [...history, { role: 'user', content: message}] )
    });
    
    const botchat = await response.json();
    console.log(botchat);

    if ('is_end' in botchat) {
      setPOI(botchat);
      setHistory(prevstate => [...prevstate, { role: 'assistant', content: botchat['choices'][0]['message']['content'] }]);
      setLoading(false);
      // TODO disable the button, enable reset
    }
    else {
      setHistory(prevstate => [...prevstate, { role: 'assistant', content: botchat['choices'][0]['message']['content'] }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="chatbot-container">
      <div className="chat-history">
      
          {history.map((entry, i) => (
            <div key={i}>
              {entry.role === 'user' && <div className="message user">{entry.content}</div> }
              {entry.role === 'assistant' && <div className="message bot"><ReactMarkdown>{entry.content}</ReactMarkdown></div> }

            </div>
          ))}
          {loading && <div className="message bot">Loading...</div>}
          <div ref={inputRef}></div>
          
      </div>
      <div className="message-box">
        <textarea
          type="text"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value) }
          onKeyDown={handleKeyDown}
          className="message-input"
        />
        
        <button className="send-btn" onClick={sendMessage}>Send</button>
        <button className="reset-btn" onClick={() => {setHistory([]); setPOI({}) }  }>Reset</button>
      </div>
    </div>
  );
};

export default Chatbot;