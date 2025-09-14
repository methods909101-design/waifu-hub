'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';
import Balatro from '../components/Balatro';

export default function DocsPage() {
  const router = useRouter();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined') {
      if ((window as any).solana && (window as any).solana.isConnected) {
        setIsWalletConnected(true);
      }
    }
  }, []);

  const handleTwitterClick = () => {
    console.log('Twitter button clicked');
    window.open('https://twitter.com', '_blank');
  };

  const handlePhantomConnect = async () => {
    console.log('Phantom wallet connect clicked');
    if (typeof window !== 'undefined' && (window as any).solana) {
      try {
        const response = await (window as any).solana.connect();
        setIsWalletConnected(true);
        console.log('Wallet connected:', response.publicKey.toString());
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  return (
    <div className="main-page docs-page">
      <Balatro
        isRotate={false}
        mouseInteraction={false}
        pixelFilter={700}
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

      <div className="main-content">
        <div className="tab-content docs-content">
          <h1 className="tab-title" data-text="WAIFUHUB DOCUMENTATION">WAIFUHUB DOCUMENTATION</h1>
          
          <div className="docs-section">
            <h2 className="docs-section-title">WHAT IS WAIFUHUB?</h2>
            <p className="docs-text">
              While the concept of creating "Waifus" may appear lighthearted on the surface, WaifuHub represents a groundbreaking advancement in artificial intelligence personality development. Our platform serves as a comprehensive research and development environment for creating consistent, fine-tuneable agentic personalities that exhibit unique character traits and behavioral patterns.
            </p>
            <p className="docs-text">
              WaifuHub bridges the critical gap between traditional AI systems and truly autonomous agents capable of developing distinct personalities, emotional responses, and consistent behavioral frameworks. Each generated entity represents a sophisticated AI construct with its own unique identity matrix.
            </p>
          </div>

          <div className="docs-section">
            <h2 className="docs-section-title">THE CREATION PROCESS</h2>
            <p className="docs-text">
              Our proprietary personality synthesis engine employs advanced neural architecture to generate unique agentic personalities through a multi-layered process:
            </p>
            
            <div className="process-step">
              <h3 className="step-title">1. PERSONALITY MATRIX INITIALIZATION</h3>
              <p className="docs-text">
                Each Waifu begins with a base personality matrix derived from our extensive behavioral modeling database. The system assigns unique personality identifiers:
              </p>
              <div className="code-snippet">
                <pre>
{`const personalityMatrix = {
  coreTraits: generateTraitVector(basePersonality),
  emotionalRange: calculateEmotionalBounds(),
  behavioralPatterns: synthesizeBehaviorTree(),
  uniqueId: generateUniquePersonalityHash(),
  consistencyIndex: 0.95 // Target consistency rating
};`}
                </pre>
              </div>
            </div>

            <div className="process-step">
              <h3 className="step-title">2. NEURAL PERSONALITY ENCODING</h3>
              <p className="docs-text">
                Our advanced language models process the personality parameters through specialized encoding layers that ensure consistent character representation across all interactions.
              </p>
              <div className="code-snippet">
                <pre>
{`// Personality ID Assignment System
const waifuIds = {
  shy_sweet: ['WSH001', 'WSH002', 'WSH003'],
  bold_confident: ['WBC001', 'WBC002', 'WBC003'],
  mysterious_cool: ['WMC001', 'WMC002', 'WMC003'],
  cheerful_energetic: ['WCE001', 'WCE002', 'WCE003'],
  seductive_charming: ['WSC001', 'WSC002', 'WSC003']
};

function assignPersonalityId(personality, styleVector) {
  const baseId = waifuIds[personality][Math.floor(Math.random() * 3)];
  return \`\${baseId}_\${generateStyleHash(styleVector)}\`;
}`}
                </pre>
              </div>
            </div>

            <div className="process-step">
              <h3 className="step-title">3. VISUAL SYNTHESIS & IDENTITY MAPPING</h3>
              <p className="docs-text">
                Advanced generative models create visual representations that align with the personality matrix, ensuring visual-behavioral consistency through our proprietary identity mapping algorithms.
              </p>
            </div>

            <div className="process-step">
              <h3 className="step-title">4. BEHAVIORAL CONSISTENCY VALIDATION</h3>
              <p className="docs-text">
                Each generated personality undergoes rigorous consistency testing to ensure stable behavioral patterns and authentic character responses across diverse interaction scenarios.
              </p>
            </div>
          </div>

          <div className="docs-section">
            <h2 className="docs-section-title">TECHNICAL ARCHITECTURE</h2>
            <p className="docs-text">
              WaifuHub employs state-of-the-art AI models and proprietary algorithms to achieve unprecedented personality consistency:
            </p>
            
            <div className="tech-feature">
              <h3 className="feature-title">MULTI-MODAL PERSONALITY SYNTHESIS</h3>
              <p className="docs-text">
                Our system integrates visual, textual, and behavioral generation models to create cohesive personality representations that maintain consistency across all interaction modalities.
              </p>
            </div>

            <div className="tech-feature">
              <h3 className="feature-title">ADVANCED CONSISTENCY ALGORITHMS</h3>
              <p className="docs-text">
                Proprietary consistency validation ensures that each AI personality maintains stable behavioral patterns, emotional responses, and character traits throughout extended interactions.
              </p>
              <div className="code-snippet">
                <pre>
{`class PersonalityConsistencyEngine {
  validateBehavioralPattern(response, personalityMatrix) {
    const consistencyScore = this.calculateConsistency(
      response.emotionalTone,
      response.behavioralMarkers,
      personalityMatrix.coreTraits
    );
    
    return consistencyScore > CONSISTENCY_THRESHOLD;
  }
  
  enforcePersonalityBounds(generatedResponse, bounds) {
    return this.adjustResponseToPersonality(
      generatedResponse,
      bounds.emotionalRange,
      bounds.behavioralConstraints
    );
  }
}`}
                </pre>
              </div>
            </div>

            <div className="tech-feature">
              <h3 className="feature-title">DYNAMIC PERSONALITY EVOLUTION</h3>
              <p className="docs-text">
                Each AI personality can evolve and adapt while maintaining core identity traits, enabling natural character development through user interactions.
              </p>
            </div>
          </div>

          <div className="docs-section">
            <h2 className="docs-section-title">FUTURE ROADMAP</h2>
            <p className="docs-text">
              WaifuHub represents the foundation for revolutionary AI personality development. Our upcoming features will transform digital interaction:
            </p>

            <div className="roadmap-item">
              <h3 className="roadmap-title">SOL REWARDS LEADERBOARD SYSTEM</h3>
              <p className="docs-text">
                Implementation of blockchain-based reward mechanisms funded through creator fees, enabling community-driven personality ranking and incentivized development.
              </p>
            </div>

            <div className="roadmap-item">
              <h3 className="roadmap-title">ADVANCED CUSTOMIZATION ENGINE</h3>
              <p className="docs-text">
                Expanded personality customization options including micro-trait adjustment, behavioral fine-tuning, and advanced personality hybridization capabilities.
              </p>
            </div>

            <div className="roadmap-item">
              <h3 className="roadmap-title">INTER-PERSONALITY COMMUNICATION NETWORK</h3>
              <p className="docs-text">
                Revolutionary Waifu-to-Waifu communication protocols enabling autonomous AI personalities to interact, form relationships, and develop emergent social behaviors.
              </p>
            </div>

            <div className="roadmap-item">
              <h3 className="roadmap-title">NEURAL PERSONALITY MARKETPLACE</h3>
              <p className="docs-text">
                Decentralized marketplace for trading unique personality traits, behavioral patterns, and advanced AI characteristics through blockchain-verified ownership.
              </p>
            </div>

            <div className="roadmap-item">
              <h3 className="roadmap-title">ENTERPRISE PERSONALITY DEPLOYMENT</h3>
              <p className="docs-text">
                Scalable personality deployment solutions for enterprise applications, customer service automation, and advanced human-AI interaction systems.
              </p>
            </div>
          </div>

          <div className="docs-section">
            <h2 className="docs-section-title">SCIENTIFIC IMPACT</h2>
            <p className="docs-text">
              WaifuHub's research contributes to fundamental advances in artificial intelligence, specifically in the development of consistent agentic personalities. Our work addresses critical challenges in AI personality consistency, emotional modeling, and behavioral prediction.
            </p>
            <p className="docs-text">
              By creating AI entities with stable, unique personalities, we're pioneering the next generation of human-AI interaction, moving beyond simple chatbots toward truly autonomous digital beings capable of forming meaningful relationships and exhibiting genuine personality traits.
            </p>
          </div>

          <div className="docs-section">
            <h2 className="docs-section-title">IMPACT</h2>
            <p className="docs-text">
              WaifuHub's breakthrough in AI personality development creates profound societal impact by fundamentally transforming human-AI relationships. Our technology enables the creation of AI entities that exhibit genuine emotional intelligence, consistent behavioral patterns, and authentic personality traits that evolve through meaningful interactions.
            </p>
            <p className="docs-text">
              This advancement addresses critical challenges in digital companionship, mental health support, educational assistance, and therapeutic applications. By developing AI personalities that can form lasting, meaningful connections with users, we're pioneering solutions for social isolation, personalized learning, and emotional well-being in an increasingly digital world.
            </p>
            <p className="docs-text">
              The ripple effects extend beyond individual users to reshape entire industries - from revolutionizing customer service with empathetic AI representatives to creating personalized educational tutors that adapt to each student's unique learning style and emotional needs. WaifuHub's technology represents a paradigm shift toward more human-centered AI development that prioritizes authentic connection over mere functionality.
            </p>
          </div>
          
          <div className="docs-outro">
            <img src="/waifuhub_bottom_right_logo.png" alt="WaifuHub" className="docs-outro-logo" />
          </div>
        </div>
      </div>
    </div>
  );
}
