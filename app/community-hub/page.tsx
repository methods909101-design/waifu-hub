'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';
import Balatro from '../components/Balatro';
import { getStoredWaifus, WaifuData } from '../lib/aiService';

export default function CommunityHubPage() {
  const router = useRouter();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedWaifu, setSelectedWaifu] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [publishedWaifus, setPublishedWaifus] = useState<WaifuData[]>([]);
  const [allWaifus, setAllWaifus] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const waifuData: any[] = [];

  const handleWaifuClick = (waifu: any) => {
    setSelectedWaifu(waifu);
    setChatMessages([]);
    setNewMessage('');
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedWaifu(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedWaifu || isChatting) return;

    const userMessage = {
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
          walletAddress: walletAddress
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.response
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setChatMessages(finalMessages);
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

  const handleLike = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to vote!');
      return;
    }
    
    if (!selectedWaifu) return;

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          waifuId: selectedWaifu.id,
          voteType: 'like'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the selected waifu with new like count
        setSelectedWaifu({
          ...selectedWaifu,
          likes: data.waifu.likes
        });

        // Update the waifu in the main list
        setAllWaifus(prev => prev.map(waifu => 
          waifu.id === selectedWaifu.id 
            ? { ...waifu, likes: data.waifu.likes }
            : waifu
        ));
      } else {
        alert(data.error || 'Failed to like waifu');
      }
    } catch (error) {
      console.error('Error liking waifu:', error);
      alert('Failed to like waifu. Please try again.');
    }
  };

  const handleDislike = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to vote!');
      return;
    }
    
    if (!selectedWaifu) return;

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          waifuId: selectedWaifu.id,
          voteType: 'dislike'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the selected waifu with new dislike count
        setSelectedWaifu({
          ...selectedWaifu,
          dislikes: data.waifu.dislikes
        });

        // Update the waifu in the main list
        setAllWaifus(prev => prev.map(waifu => 
          waifu.id === selectedWaifu.id 
            ? { ...waifu, dislikes: data.waifu.dislikes }
            : waifu
        ));
      } else {
        alert(data.error || 'Failed to dislike waifu');
      }
    } catch (error) {
      console.error('Error disliking waifu:', error);
      alert('Failed to dislike waifu. Please try again.');
    }
  };

  // Load published waifus from database and localStorage
  useEffect(() => {
    console.log('Community Hub page loaded successfully!');
    
    const loadCommunityWaifus = async () => {
      if (typeof window !== 'undefined') {
        let communityWaifus: any[] = [];
        let waifusLoaded = false;

        // Try to load published waifus from database first
        try {
          const response = await fetch('/api/waifus?type=community');
          const data = await response.json();
          
          if (data.success && data.waifus && data.waifus.length > 0) {
            console.log('Loaded community waifus from database:', data.waifus);
            
            // Convert database waifus to community format
            communityWaifus = data.waifus.map((waifu: any) => ({
              id: waifu.id,
              name: waifu.name.toUpperCase(),
              creator: waifu.users?.username || waifu.users?.wallet_address?.substring(0, 5) || 'Anonymous',
              biography: waifu.biography || 'No biography provided.',
              personality: waifu.personality,
              style: waifu.style,
              hairColor: waifu.hair_color,
              characterProfile: waifu.character_profile,
              likes: waifu.likes || 0,
              dislikes: waifu.dislikes || 0,
              publishedAt: new Date(waifu.published_at || waifu.created_at).getTime(),
              videoUrl: waifu.video_url,
              media: waifu.video_url ? [{ type: 'video', url: waifu.video_url }] : []
            }));
            waifusLoaded = true;
          }
        } catch (error) {
          console.error('Error loading community waifus from database:', error);
        }

        // Fallback to localStorage if database didn't work
        if (!waifusLoaded) {
          console.log('Loading community waifus from localStorage...');
          const publishedList = localStorage.getItem('published_waifus');
          if (publishedList) {
            try {
              const publishedIds = JSON.parse(publishedList);
              const storedWaifus = getStoredWaifus();
              const published = storedWaifus.filter(waifu => publishedIds.includes(waifu.id));
              setPublishedWaifus(published);
              
              // Get stored wallet address for creator name
              const storedWalletAddress = localStorage.getItem('wallet_address');
              const creatorName = storedWalletAddress ? storedWalletAddress.substring(0, 5) : 'You';
              
              // Convert published waifus to community format
              communityWaifus = published.map(waifu => ({
                id: `user_${waifu.id}`,
                name: waifu.name.toUpperCase(),
                creator: creatorName,
                biography: waifu.biography || 'No biography provided.',
                personality: waifu.personality,
                style: waifu.style,
                hairColor: waifu.hairColor,
                characterProfile: waifu.characterProfile,
                likes: 0,
                dislikes: 0,
                publishedAt: Date.now(),
                videoUrl: waifu.videoUrl,
                media: waifu.videoUrl ? [{ type: 'video', url: waifu.videoUrl }] : []
              }));
            } catch (error) {
              console.error('Error parsing published waifus:', error);
            }
          }
        }

        // Combine with sample data and add timestamps
        const sampleWithTimestamps = waifuData.map(waifu => ({
          ...waifu,
          publishedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Random time within last week
        }));
        
        setAllWaifus([...sampleWithTimestamps, ...communityWaifus]);
        
        // Check if wallet is currently connected via Phantom
        if ((window as any).solana && (window as any).solana.isConnected) {
          setIsWalletConnected(true);
          const walletAddress = localStorage.getItem('wallet_address');
          if (walletAddress) {
            setWalletAddress(walletAddress);
          }
        }
      }
    };

    loadCommunityWaifus();
  }, []);

  // Sort waifus based on selected criteria
  const sortedWaifus = [...allWaifus].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.publishedAt - a.publishedAt;
    } else if (sortBy === 'most_liked') {
      return b.likes - a.likes;
    }
    return 0;
  });

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
        setWalletAddress(address);
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
              className="nav-tab"
              onClick={() => router.push('/my-waifus')}
            >
              MY WAIFUS
            </button>
            <button 
              className="nav-tab active"
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
          <h2 className="tab-title" data-text="COMMUNITY HUB">COMMUNITY HUB</h2>
          <p className="voting-restriction-text">You can only vote once every 10 minutes, so pick your Waifus wisely</p>
          
          <div className="sort-section">
            <label className="sort-label">SORT BY</label>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="most_liked">Most Liked</option>
            </select>
          </div>
          
          <div className="community-grid">
            {sortedWaifus.map((waifu) => (
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
                <p className="waifu-creator">{waifu.creator}</p>
                <div className="card-like-section">
                  <button 
                    className="card-dislike-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWaifu(waifu);
                      handleDislike();
                    }}
                  >
                    <span className="thumbs-down">👎</span>
                    <span className="dislike-count">{waifu.dislikes || 0}</span>
                  </button>
                  <button 
                    className="card-like-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWaifu(waifu);
                      handleLike();
                    }}
                  >
                    <span className="thumbs-up">👍</span>
                    <span className="like-count">{waifu.likes}</span>
                  </button>
                </div>
              </div>
            ))}
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
                  <p className="popup-creator">Created by {selectedWaifu.creator?.replace('by ', '')}</p>
                </div>
                
                <div className="biography-section">
                  <h3 className="section-title">BIOGRAPHY</h3>
                  <p className="biography-text">{selectedWaifu.biography}</p>
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
                    <button className="dislike-button" onClick={handleDislike}>
                      <span className="thumbs-down">👎</span>
                      <span className="dislike-count">{selectedWaifu.dislikes || 0}</span>
                    </button>
                    <button className="like-button" onClick={handleLike}>
                      <span className="thumbs-up">👍</span>
                      <span className="like-count">{selectedWaifu.likes}</span>
                    </button>
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
