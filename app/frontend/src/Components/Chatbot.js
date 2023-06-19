import React, { useState, useEffect, useRef, useContext } from 'react';
import DataContext from '../DataContext';
import ReactMarkdown from 'react-markdown';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';


import './Chatbot.css';

const Chatbot = () => {
  const { poi, setPOI } = useContext(DataContext);

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [chatState, setChatState] = useState('chat'); //chat, preparing, result
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sendBtnDisabled, setSendBtnDisabled] = useState(false);
  const inputRef = useRef(null);
  const chatInputRef = useRef(null);

  const scrollToBottom = () => {
    inputRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const resetChat = async () => {
    setPOI({});
    setHistory([]);
    setMessage('');
    setLoading(false);
    setPreparing(false);
    setShowWarning(false);
    setChatState('chat');
    chatInputRef.current.disabled = false;
    setSendBtnDisabled(false);
  }

  let travel_summary = null;
  
  const sendMessage = async () => {
    if (!message) return;
    
    setLoading(true);
    setHistory(prevstate => [...prevstate, { role: 'user', content: message}]);
    
    console.log(JSON.stringify( { role: 'user', content: message} ));
    setMessage('');
    

    if (chatState === 'chat') {
        
      const response = await fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}chat`, {
        // mode: 'no-cors', 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(  [...history, { role: 'user', content: message}] )
      });

      const botchat = await response.json();
      console.log(botchat);

      setHistory(prevstate => [...prevstate, { role: 'assistant', content: botchat['choices'][0]['message']['content'] }]);
      if ('is_chat_end' in botchat ){
        travel_summary = botchat['travel_summary'];

        setLoading(false);
        setChatState('preparing');
        setPreparing(true);
        chatInputRef.current.disabled = true;
        setSendBtnDisabled(true);

      
        //preparing
        const respPrep = await fetch(`${process.env.REACT_APP_BACKEND_ENDPOINT}chat/prepare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(  {"travel_summary": travel_summary} )
        });

        const respResult = await respPrep.json();
        console.log(respResult);
        setHistory(prevstate => [...prevstate, { role: 'assistant', content: respResult['choices'][0]['message']['content'] }]);
        setPreparing(false);
        setChatState('result');
        setPOI(respResult);
        setShowWarning(true);


      } //is chat end else
      else{
        setLoading(false);
        setShowWarning(false);
      }

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
              {entry.role === 'user' && <div className="message user">{entry.content}</div>  }
              {entry.role === 'assistant' && 
                <div className="message bot">
                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                </div> 
              }
              
            </div>
          ))}
          {loading && <div className="message bot">Loading...</div>}
          {preparing && <div className="message bot status-msg">Preparing, hang on ...</div>}
          {showWarning && <Alert severity="warning">Information generated may not be accurate. Please verify before using</Alert>}
          <div ref={inputRef}></div>
          
      </div>
    
      <div className="message-box">
        <IconButton aria-label="delete" size="large" color="error" onClick={resetChat}>
          <CleaningServicesTwoToneIcon />
        </IconButton>

        <div className="messagediv">
          <textarea
            ref={chatInputRef}
            type="text"
            placeholder="Which city you want to go? How many day? In which month ? ... "
            value={message}
            onChange={(e) => setMessage(e.target.value) }
            onKeyDown={handleKeyDown}
            className="message-input"
          />
          <IconButton disabled={sendBtnDisabled} aria-label="Send" size="large" color="success" onClick={sendMessage} className='send-icon'> 
              <SendTwoToneIcon />
          </IconButton>
        </div>
    </div>
    </div>
  );
};

export default Chatbot;