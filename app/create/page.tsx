'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';
import Balatro from '../components/Balatro';
import { saveWaifu, WaifuData } from '../lib/aiService';

export default function CreatePage() {
  const router = useRouter();
  const [showWaifuText, setShowWaifuText] = useState(false);
  const [waifuTextAnimating, setWaifuTextAnimating] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [waifuName, setWaifuName] = useState('');
  const [personality, setPersonality] = useState('Shy & Sweet');
  const [style, setStyle] = useState('School Girl');
  const [hairColor, setHairColor] = useState('Black');
  const [biography, setBiography] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    console.log('Create page loaded successfully!');
    
    // Check if wallet is already connected or restore from localStorage
    if (typeof window !== 'undefined') {
      // Check if wallet was previously connected (saved before refresh)
      const savedWalletState = localStorage.getItem('waifuhub_wallet_connected');
      const savedCooldownTime = localStorage.getItem('waifuhub_cooldown_time');
      const savedTimestamp = localStorage.getItem('waifuhub_cooldown_timestamp');
      
      if (savedWalletState === 'true') {
        setIsWalletConnected(true);
        
        // Restore cooldown timer if it's still active
        if (savedCooldownTime && savedTimestamp) {
          const timeElapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
          const remainingTime = parseInt(savedCooldownTime) - timeElapsed;
          
          if (remainingTime > 0) {
            setCooldownTime(remainingTime);
          }
          
          // Clean up localStorage after restoring
          localStorage.removeItem('waifuhub_wallet_connected');
          localStorage.removeItem('waifuhub_cooldown_time');
          localStorage.removeItem('waifuhub_cooldown_timestamp');
        }
      }
      
      // Also check if wallet is currently connected via Phantom
      if ((window as any).solana && (window as any).solana.isConnected) {
        setIsWalletConnected(true);
      }
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

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

  const handleGenerateWaifu = async () => {
    // Check if wallet is connected
    if (!isWalletConnected) {
      alert('Please connect your Phantom wallet first!');
      return;
    }

    // Check if cooldown is active
    if (cooldownTime > 0) {
      return;
    }

    // Check if name is provided
    if (!waifuName.trim()) {
      alert('Please enter a name for your waifu!');
      return;
    }

    console.log('Generate Waifu clicked');
    setIsGenerating(true);
    
    try {
      // Call the API to generate waifu
      const walletAddress = localStorage.getItem('wallet_address');
      
      const response = await fetch('/api/generate-waifu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: waifuName.trim(),
          personality,
          style,
          hairColor,
          biography: biography.trim(),
          walletAddress
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save the waifu data (always save to localStorage for compatibility)
        saveWaifu(data.waifu);
        
        // Log database usage status
        console.log('Waifu created:', data.waifu);
        console.log('Database used:', data.databaseUsed);
        
        // Start 60-second cooldown
        setCooldownTime(60);
        
        // Show "WAIFU GENERATED" text immediately
        setShowWaifuText(true);

        // After 3 seconds, start the animation towards MY WAIFUS tab
        setTimeout(() => {
          setWaifuTextAnimating(true);
          
          // After animation completes, redirect to MY WAIFUS page while preserving wallet state
          setTimeout(() => {
            // Save wallet connection state to localStorage before redirect
            if (isWalletConnected) {
              localStorage.setItem('waifuhub_wallet_connected', 'true');
              localStorage.setItem('waifuhub_cooldown_time', cooldownTime.toString());
              localStorage.setItem('waifuhub_cooldown_timestamp', Date.now().toString());
            }
            
            // Redirect to MY WAIFUS page
            router.push('/my-waifus');
          }, 2000); // Animation duration
        }, 3000); // Show text for 3 seconds before animating
      } else {
        throw new Error(data.error || 'Failed to generate waifu');
      }
    } catch (error) {
      console.error('Error generating waifu:', error);
      
      // Show specific error message to user
      let errorMessage = 'Failed to generate waifu. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Make error messages more user-friendly
      if (errorMessage.includes('Database not configured')) {
        errorMessage = 'Database setup required. Please contact support to set up the database schema.';
      } else if (errorMessage.includes('Failed to create user in database')) {
        errorMessage = 'Database connection failed. Please ensure the database schema is properly set up.';
      } else if (errorMessage.includes('Failed to store waifu in database')) {
        errorMessage = 'Database storage failed. Please ensure the database schema is properly set up.';
      } else if (errorMessage.includes('You must wait 10 minutes')) {
        errorMessage = 'Rate limit: You can only create a waifu once every 10 minutes. Please wait before trying again.';
      } else if (errorMessage.includes('Missing required fields')) {
        errorMessage = 'Please fill in all required fields (name, personality, style, hair color) and connect your wallet.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
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
      
      {/* WAIFU GENERATED Text Overlay */}
      {showWaifuText && (
        <div className={`waifu-generated-overlay ${waifuTextAnimating ? 'animating-to-tab' : ''}`}>
          <h1 className="waifu-generated-text">
            {waifuName.trim() ? `${waifuName.toUpperCase()} GENERATED` : 'WAIFU GENERATED'}
          </h1>
        </div>
      )}
      
      <header className="main-header">
        <div className="header-nav">
          <div className="nav-tabs-left">
            <button 
              className="nav-tab active"
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
          <h2 className="tab-title" data-text="CREATE YOUR AI WAIFU">CREATE YOUR AI WAIFU</h2>
          <p className="creation-restriction-text">You can only create a Waifu once every 10 minutes</p>
          <p className="biography-guidance-text">The biography will serve as your AI's context/characteristics, curate the biography to match the Waifu you are looking to create.</p>
          <div className="anime-girl-container">
            <img src="/anime_gif2.gif" alt="Anime Girl" className="anime-girl-gif" />
          </div>
          <div className="create-form">
            <div className="form-group">
              <label className="form-label">WAIFU NAME</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter name..." 
                maxLength={10}
                value={waifuName}
                onChange={(e) => setWaifuName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PERSONALITY</label>
              <select 
                className="form-select personality-select"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              >
                <option value="Shy & Sweet" className="personality-shy">Shy & Sweet</option>
                <option value="Bold & Confident" className="personality-bold">Bold & Confident</option>
                <option value="Mysterious & Cool" className="personality-mysterious">Mysterious & Cool</option>
                <option value="Cheerful & Energetic" className="personality-cheerful">Cheerful & Energetic</option>
                <option value="Seductive & Charming" className="personality-seductive">Seductive & Charming</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">STYLE</label>
              <select 
                className="form-select style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="School Girl" className="style-schoolgirl">School Girl</option>
                <option value="Bikini" className="style-bikini">Bikini</option>
                <option value="Formal" className="style-formal">Formal</option>
                <option value="Devil" className="style-devil">Devil</option>
                <option value="Princess" className="style-princess">Princess</option>
                <option value="Tactical" className="style-tactical">Tactical</option>
                <option value="Maid" className="style-maid">Maid</option>
                <option value="Gothic" className="style-gothic">Gothic</option>
                <option value="Casual" className="style-casual">Casual</option>
                <option value="Nurse" className="style-nurse">Nurse</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">HAIR COLOR</label>
              <select 
                className="form-select hair-select"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
              >
                <option value="Black" className="hair-black">Black</option>
                <option value="Brown" className="hair-brown">Brown</option>
                <option value="Blonde" className="hair-blonde">Blonde</option>
                <option value="Red" className="hair-red">Red</option>
                <option value="Pink" className="hair-pink">Pink</option>
                <option value="Blue" className="hair-blue">Blue</option>
                <option value="Purple" className="hair-purple">Purple</option>
                <option value="Green" className="hair-green">Green</option>
                <option value="White" className="hair-white">White</option>
                <option value="Silver" className="hair-silver">Silver</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">BIOGRAPHY</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe your waifu's background and story..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
              ></textarea>
            </div>
            <button 
              className={`create-button ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerateWaifu}
              disabled={!isWalletConnected || cooldownTime > 0 || isGenerating}
              style={{
                opacity: (!isWalletConnected || cooldownTime > 0 || isGenerating) ? 0.5 : 1,
                cursor: (!isWalletConnected || cooldownTime > 0 || isGenerating) ? 'not-allowed' : 'pointer'
              }}
            >
              {!isWalletConnected 
                ? 'CONNECT WALLET FIRST' 
                : cooldownTime > 0 
                  ? `COOLDOWN: ${cooldownTime}s` 
                  : isGenerating
                    ? 'GENERATING...'
                    : 'GENERATE WAIFU'
              }
            </button>
            {isGenerating && (
              <p className="generation-subtext">This could take a moment</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
