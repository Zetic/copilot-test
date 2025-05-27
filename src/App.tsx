import { useEffect, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './App.css'

// Interface for GitHub repository
interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
}

function App() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHome, setShowHome] = useState<boolean>(true);
  const [inputUsername, setInputUsername] = useState<string>('');
  const [githubUsername, setGithubUsername] = useState<string>('');
  
  // State for alphabet tracking
  const [activeAlphabetRange, setActiveAlphabetRange] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  // Reference to the slider component
  const sliderRef = useRef<Slider | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse input (handle both username and full GitHub URL)
    let username = inputUsername.trim();
    
    // Extract username from GitHub URL if provided
    if (username.includes('github.com/')) {
      const parts = username.split('github.com/');
      username = parts[1].split('/')[0];
    }
    
    // Set username and switch to repository view
    setGithubUsername(username);
    setShowHome(false);
  };

  useEffect(() => {
    // Only fetch when not on home screen and username is available
    if (!showHome && githubUsername) {
      // Fetch public repositories from GitHub API (up to 100 repositories)
      setLoading(true);
      fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100`)
        .then((res) => res.json())
        .then((data) => {
          // Sort repositories alphabetically by name
          const sortedRepos = [...data].sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          );
          setRepos(sortedRepos);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching repositories:', error);
          setLoading(false);
        });
    }
  }, [showHome, githubUsername]);

  // Group repositories by first letter for alphabet tracker
  const getAlphabetRanges = () => {
    if (!repos.length) return [];
    
    // Get all unique first letters from repository names
    const firstLetters = repos.map(repo => 
      repo.name.charAt(0).toUpperCase()
    ).filter((letter, index, arr) => 
      arr.indexOf(letter) === index
    ).sort();
    
    // Group letters into ranges (A-E, F-J, etc.)
    const ranges: string[] = [];
    const rangeSize = 5;
    
    for (let i = 0; i < firstLetters.length; i += rangeSize) {
      const range = firstLetters.slice(i, i + rangeSize);
      ranges.push(`${range[0]}-${range[range.length - 1]}`);
    }
    
    return ranges;
  };
  
  // Get the alphabet range for a specific repo index
  const getAlphabetRangeForIndex = (index: number): string => {
    if (!repos.length || index < 0 || index >= repos.length) return '';
    
    const firstLetter = repos[index].name.charAt(0).toUpperCase();
    const ranges = getAlphabetRanges();
    
    for (const range of ranges) {
      const [start, end] = range.split('-');
      if (firstLetter >= start && firstLetter <= end) {
        return range;
      }
    }
    
    return '';
  };
  
  // Update alphabet range when slide changes
  const handleAfterChange = (index: number) => {
    setCurrentSlide(index);
    const newRange = getAlphabetRangeForIndex(index);
    if (newRange !== activeAlphabetRange) {
      setActiveAlphabetRange(newRange);
    }
  };

  // Navigate to repositories starting with letters in a specific range
  const handleAlphabetRangeClick = (range: string) => {
    if (!repos.length) return;
    
    const [startLetter] = range.split('-');
    
    // Find the first repository starting with the range's first letter
    const targetIndex = repos.findIndex(repo => 
      repo.name.charAt(0).toUpperCase() >= startLetter
    );
    
    if (targetIndex !== -1 && sliderRef.current) {
      sliderRef.current.slickGoTo(targetIndex);
    }
  };

  // Determine display mode based on repository count
  const getSliderSettings = (repoCount: number) => {
    // Always show 3 slides (or the number of repositories if less than 3)
    const slidesToShow = Math.min(3, Math.max(repoCount, 1));
    
    return {
      dots: false, // Replace dots with custom slider
      infinite: true, // Always enable infinite scrolling
      speed: 500,
      slidesToShow: slidesToShow,
      slidesToScroll: 1,
      centerMode: true, // Always use center mode for consistent layout
      centerPadding: '10px',
      autoplay: false,
      arrows: true, // Always show arrows
      draggable: true, // Enable drag to spin
      swipe: true,
      swipeToSlide: true,
      afterChange: handleAfterChange, // Track slide changes for alphabet tracker
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(2, Math.max(repoCount, 1)),
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
      ]
    };
  };

  // Create placeholder repositories for consistent UI when there are few repositories
  const getRepositoriesWithPlaceholders = (repositories: Repository[]): (Repository | null)[] => {
    if (repositories.length >= 3) {
      return repositories;
    }
    
    // Add placeholder repositories (null) to always have at least 3 cards
    const placeholders = Array(3 - repositories.length).fill(null);
    return [...repositories, ...placeholders];
  };

  return (
    <div className="container">
      {showHome ? (
        <div className="home-screen">
          <header>
            <h1>GitHub Profile Viewer</h1>
            <p className="description">View styled GitHub profiles easily</p>
          </header>
          <section className="input-section">
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                className="github-input"
                placeholder="Enter GitHub username or URL (e.g., octocat or https://github.com/octocat)" 
                value={inputUsername} 
                onChange={(e) => setInputUsername(e.target.value)}
                required
              />
              <button type="submit" className="submit-btn">View Profile</button>
            </form>
          </section>
        </div>
      ) : (
        <>
          <header>
            <h1>GitHub</h1>
            <a 
              href={`https://github.com/${githubUsername}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="github-banner"
            >
              github.com/{githubUsername}
            </a>
          </header>
          <section>
            <h2>Repositories</h2>
            {loading ? (
              <div className="loading">Loading repositories...</div>
            ) : repos.length === 0 ? (
              <div className="no-repos">No public repositories available</div>
            ) : (
              <div className="carousel-container">
                <Slider ref={sliderRef} {...getSliderSettings(repos.length)} className="repository-slider">
                  {getRepositoriesWithPlaceholders(repos).map((repo, index) => (
                    <div key={repo ? repo.id : `placeholder-${index}`} className="repo-card">
                      {repo ? (
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-link">
                          <h3>{repo.name}</h3>
                          <div className="repo-description">
                            {repo.description || "No description available"}
                          </div>
                          <div className="repo-stats">
                            <span>⭐ {repo.stargazers_count}</span>
                            <span>🍴 {repo.forks_count}</span>
                          </div>
                        </a>
                      ) : (
                        <div className="placeholder-content">
                          <h3>Placeholder</h3>
                          <div className="repo-description">
                            This is a placeholder card to maintain carousel layout
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </Slider>
                
                {/* Alphabet range tracker */}
                {repos.length > 0 && (
                  <div className="alphabet-tracker">
                    {getAlphabetRanges().map((range) => (
                      <div 
                        key={range} 
                        className={`alphabet-range ${activeAlphabetRange === range ? 'active' : ''}`}
                        onClick={() => handleAlphabetRangeClick(range)}
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Custom slider bar (replaces dots) */}
                <div className="slider-container">
                  <div 
                    className="slider-bar"
                    style={{
                      width: `${Math.min(100, repos.length * 3)}%`
                    }}
                  >
                    <div 
                      className="slider-handle" 
                      style={{
                        left: `${repos.length > 0 ? (currentSlide / (repos.length - 1)) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default App
