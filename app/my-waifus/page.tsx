'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';
import Balatro from '../components/Balatro';
import { getStoredWaifus, WaifuData, ChatMessage, getChatHistory, saveChatHistory } from '../lib/aiService';

export default function MyWaifusPage() {
  const router = useRouter();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [waifus, setWaifus] = useState<WaifuData[]>([]);
  const [selectedWaifu, setSelectedWaifu] = useState<WaifuData | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [publishedWaifus, setPublishedWaifus] = useState<Set<string>>(new Set());

  const handleWaifuClick = (waifu: WaifuData) => {
    setSelectedWaifu(waifu);
    const history = getChatHistory(waifu.id);
    setChatMessages(history);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedWaifu(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const handlePublishWaifu = async (waifuId: string) => {
    console.log(`Publishing waifu ${waifuId} to community`);
    
    const walletAddress = localStorage.getItem('wallet_address');
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const response = await fetch('/api/waifus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish',
          waifuId,
          walletAddress
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPublishedWaifus(prev => {
          const newSet = new Set(prev);
          newSet.add(waifuId);
          return newSet;
        });
        alert('Waifu published to community successfully!');
      } else {
        alert(data.error || 'Failed to publish waifu');
      }
    } catch (error) {
      console.error('Error publishing waifu:', error);
      alert('Failed to publish waifu. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedWaifu || isChatting) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage.trim()
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setNewMessage('');
    setIsChatting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waifuData: selectedWaifu,
          messages: chatMessages,
          newMessage: userMessage.content,
          walletAddress: localStorage.getItem('wallet_address')
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.response
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setChatMessages(finalMessages);
        saveChatHistory(selectedWaifu.id, finalMessages);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    console.log('My Waifus page loaded successfully!');
    
    const loadWaifus = async () => {
      if (typeof window !== 'undefined') {
        const walletAddress = localStorage.getItem('wallet_address');
        let waifusLoaded = false;
        
        if (walletAddress) {
          try {
            // Try to load waifus from Supabase
            const response = await fetch(`/api/waifus?type=my&walletAddress=${walletAddress}`, {
              method: 'GET'
            });
            
            const data = await response.json();
            
            if (data.success && data.waifus && data.waifus.length > 0) {
              console.log('Loaded waifus from database:', data.waifus);
              
              // Transform database waifus to match WaifuData interface
              const transformedWaifus = data.waifus.map((waifu: any) => ({
                id: waifu.id,
                name: waifu.name,
                personality: waifu.personality,
                style: waifu.style,
                hairColor: waifu.hair_color,
                biography: waifu.biography || '',
                characterProfile: waifu.character_profile,
                videoUrl: waifu.video_url, // Transform video_url to videoUrl
                createdAt: new Date(waifu.created_at),
                isPublished: waifu.is_published
              }));
              
              setWaifus(transformedWaifus);
              
              // Set published state based on database
              const publishedIds = new Set<string>(
                data.waifus
                  .filter((waifu: any) => waifu.is_published)
                  .map((waifu: any) => waifu.id as string)
              );
              setPublishedWaifus(publishedIds);
              waifusLoaded = true;
            }
          } catch (error) {
            console.error('Error loading waifus from database:', error);
          }
        }
        
        // Always try localStorage as fallback or primary source
        if (!waifusLoaded) {
          console.log('Loading waifus from localStorage...');
          const storedWaifus = getStoredWaifus();
          console.log('Found stored waifus:', storedWaifus);
          setWaifus(storedWaifus);
          
          // Load published state from localStorage
          const publishedList = localStorage.getItem('published_waifus');
          if (publishedList) {
            try {
              const parsed = JSON.parse(publishedList);
              setPublishedWaifus(new Set(parsed));
            } catch (error) {
              console.error('Error parsing published waifus:', error);
            }
          }
        }
        
        // Check if wallet is currently connected via Phantom
        if ((window as any).solana && (window as any).solana.isConnected) {
          setIsWalletConnected(true);
        }
      }
    };
    
    loadWaifus();
  }, []);

  const handleTwitterClick = () => {
    console.log('Twitter button clicked');
    window.open('https://x.com/waifu_xyz', '_blank');
  };

  const handlePhantomConnect = async () => {
    console.log('Phantom wallet connect clicked');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if Phantom is installed
    const getProvider = () => {
      if ('phantom' in window) {
        const provider = (window as any).phantom?.solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      // Fallback to window.solana for older versions
      if ('solana' in window) {
        const provider = (window as any).solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      return null;
    };

    const provider = getProvider();
    
    if (provider) {
      try {
        const response = await provider.connect();
        const address = response.publicKey.toString();
        setIsWalletConnected(true);
        localStorage.setItem('wallet_address', address);
        console.log('Wallet connected:', address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        if (error.code === 4001) {
          alert('Connection request was rejected. Please try again.');
        } else {
          alert('Failed to connect wallet. Please try again.');
        }
      }
    } else {
      // Phantom is not installed, redirect to download
      alert('Phantom wallet not detected. You will be redirected to install it.');
      window.open('https://phantom.app/', '_blank');
    }
  };

  return (
    <div className="main-page">
      <Balatro
        isRotate={false}
        mouseInteraction={false}
        pixelFilter={460}
        color1="#f5e6d3"
        color2="#e6d7c4"
        color3="#d4c4b1"
      />
      
      <header className="main-header">
        <div className="header-nav">
          <div className="nav-tabs-left">
            <button 
              className="nav-tab"
              onClick={() => router.push('/create')}
            >
              CREATE
            </button>
            <button 
              className="nav-tab active"
              onClick={() => router.push('/my-waifus')}
            >
              MY WAIFUS
            </button>
            <button 
              className="nav-tab"
              onClick={() => router.push('/community-hub')}
            >
              COMMUNITY HUB
            </button>
          </div>
          <img src="/waifuhub_bottom_right_logo.png" alt="WaifuHub" className="header-logo" />
        </div>
        <div className="header-buttons">
          <button onClick={() => router.push('/docs')} className="docs-header-button">
            DOCS
          </button>
          <button className="twitter-header-button" onClick={handleTwitterClick}>
            TWITTER
          </button>
          <button 
            className={`phantom-connect ${isWalletConnected ? 'connected' : ''}`}
            onClick={handlePhantomConnect}
          >
            {isWalletConnected ? 'CONNECTED' : 'CONNECT'}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="tab-content">
          <h2 className="tab-title" data-text="MY WAIFUS">MY WAIFUS</h2>
          <p className="privacy-warning-text">Once your Waifu is published to the community, you will not be able to private it</p>
          <div className="community-grid">
            {waifus.length === 0 ? (
              <div className="waifu-card">
                <div className="waifu-preview"></div>
                <h3 className="waifu-name">NO WAIFUS</h3>
                <p className="waifu-creator">Go to CREATE tab to generate your first waifu!</p>
                <div className="card-like-section">
                  <button 
                    className="publish-button" 
                    onClick={() => router.push('/create')}
                  >
                    CREATE
                  </button>
                </div>
              </div>
            ) : (
              waifus.map((waifu) => (
                <div key={waifu.id} className="waifu-card">
                  <div className="waifu-preview" onClick={() => handleWaifuClick(waifu)}>
                    {waifu.videoUrl && (
                      <video 
                        src={waifu.videoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <h3 className="waifu-name">{waifu.name}</h3>
                  <p className="waifu-creator">by You</p>
                  <div className="card-like-section">
                    {publishedWaifus.has(waifu.id) ? (
                      <button 
                        className="publish-button published" 
                        disabled
                      >
                        PUBLISHED
                      </button>
                    ) : (
                      <button 
                        className="publish-button" 
                        onClick={() => handlePublishWaifu(waifu.id)}
                      >
                        PUBLISH
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Waifu Profile Popup */}
      {isPopupOpen && selectedWaifu && (
        <>
          {/* Dark overlay */}
          <div className="popup-overlay" onClick={handleClosePopup}></div>
          
          {/* Popup content */}
          <div className="waifu-popup">
            <button className="popup-close" onClick={handleClosePopup}>✕</button>
            
            <div className="popup-content">
              {/* Left side - Video and Chat */}
              <div className="popup-left">
                <div className="video-section">
                  <div className="popup-video">
                    {selectedWaifu.videoUrl ? (
                      <video 
                        src={selectedWaifu.videoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="video-placeholder"></div>
                    )}
                  </div>
                </div>
                
                <div className="chat-section">
                  <h3 className="section-title">CHAT WITH {selectedWaifu.name.toUpperCase()}</h3>
                  <div className="chat-container">
                    <div className="chat-messages">
                      {chatMessages.length === 0 ? (
                        <div className="chat-message ai-message">
                          <span className="message-text">Hello! I'm {selectedWaifu.name}. How are you today?</span>
                        </div>
                      ) : (
                        chatMessages.map((message, index) => (
                          <div key={index} className={`chat-message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
                            <span className="message-text">{message.content}</span>
                          </div>
                        ))
                      )}
                      {isChatting && (
                        <div className="chat-message ai-message">
                          <span className="message-text">{selectedWaifu.name} is typing...</span>
                        </div>
                      )}
                    </div>
                    <div className="chat-input-container">
                      <input 
                        type="text" 
                        className="chat-input" 
                        placeholder={`Message ${selectedWaifu.name}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isChatting}
                      />
                      <button 
                        className="chat-send"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isChatting}
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Biography and Info */}
              <div className="popup-right">
                <div className="waifu-header">
                  <h2 className="popup-waifu-name">{selectedWaifu.name}</h2>
                  <p className="popup-creator">Created by You</p>
                </div>
                
                <div className="biography-section">
                  <h3 className="section-title">BIOGRAPHY</h3>
                  <p className="biography-text">{selectedWaifu.biography || 'No biography provided.'}</p>
                </div>
                
                <div className="personality-chat-level">
                  <div className="personality-section">
                    <h3 className="section-title">PERSONALITY</h3>
                    <p className="personality-text">{selectedWaifu.personality}</p>
                  </div>
                  
                  <div className="agentic-section">
                    <h3 className="section-title">AGENTIC PROPERTIES</h3>
                    <div className="agentic-text">
                      <div>ID: {selectedWaifu.id}</div>
                      <div>Style: {selectedWaifu.style || 'Unknown'}</div>
                      <div>Hair: {selectedWaifu.hairColor || 'Unknown'}</div>
                      <div>Consistency: 95%</div>
                      <div>Autonomy Level: Advanced</div>
                    </div>
                  </div>
                  
                  <div className="like-section">
                    {publishedWaifus.has(selectedWaifu.id) ? (
                      <button 
                        className="publish-button published" 
                        disabled
                      >
                        PUBLISHED
                      </button>
                    ) : (
                      <button 
                        className="publish-button" 
                        onClick={() => handlePublishWaifu(selectedWaifu.id)}
                      >
                        PUBLISH
                      </button>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
