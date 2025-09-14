'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css';
import Balatro from './components/Balatro';

// Test component to verify Supabase connection
function DatabaseTest() {
  const [users, setUsers] = useState<any[]>([]);
  const [waifus, setWaifus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        // Test users table
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
        }

        // Test waifus table
        const waifusResponse = await fetch('/api/waifus?type=community');
        if (waifusResponse.ok) {
          const waifusData = await waifusResponse.json();
          setWaifus(waifusData.waifus || []);
        }
      } catch (error) {
        console.error('Database test error:', error);
      } finally {
        setLoading(false);
      }
    };

    testDatabase();
  }, []);

  if (loading) return <div style={{ color: 'white', position: 'fixed', top: '10px', left: '10px' }}>Testing database...</div>;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <div><strong>Database Status:</strong></div>
      <div>Users: {users.length}</div>
      <div>Waifus: {waifus.length}</div>
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        {users.length > 0 || waifus.length > 0 ? '✅ Connected' : '❌ No data'}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [showMainPage, setShowMainPage] = useState(false);

  useEffect(() => {
    console.log('WaifuHub loaded successfully!');
    
    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnterClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleEnterClick = () => {
    console.log('Enter button clicked');
    router.push('/create');
  };

  const handleTwitterClick = () => {
    console.log('Twitter button clicked');
    window.open('https://twitter.com', '_blank');
  };

  return (
    <div className="container landing">
      <DatabaseTest />
      <Balatro
        isRotate={false}
        mouseInteraction={false}
        pixelFilter={700}
        color1="#f5e6d3"
        color2="#e6d7c4"
        color3="#d4c4b1"
      />
      
      <div className="logo-container">
        <div className="logo"></div>
      </div>
      
      <div className="title-container">
        <div className="title"></div>
      </div>
      
      <div className="independent-subheader">AI Personality Construction Platform</div>
      
      <div className="buttons-container">
        <button onClick={handleEnterClick} className="retro-button">
          ENTER
        </button>
        <button onClick={handleTwitterClick} className="retro-button">
          TWITTER
        </button>
      </div>
    </div>
  );
}
