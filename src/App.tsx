import { useEffect, useState } from 'react'
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
      // Fetch public repositories from GitHub API
      setLoading(true);
      fetch(`https://api.github.com/users/${githubUsername}/repos`)
        .then((res) => res.json())
        .then((data) => {
          setRepos(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching repositories:', error);
          setLoading(false);
        });
    }
  }, [showHome, githubUsername]);

  // Determine display mode based on repository count
  const getSliderSettings = (repoCount: number) => {
    // For 1-3 repositories, adjust settings to avoid carousel display issues
    const slidesToShow = repoCount < 3 ? repoCount : 3;
    const useCarousel = repoCount > 3;
    
    return {
      dots: useCarousel,
      infinite: useCarousel,
      speed: 500,
      slidesToShow: slidesToShow,
      slidesToScroll: 1,
      centerMode: useCarousel,
      centerPadding: '10px',
      autoplay: false,
      arrows: useCarousel,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(2, repoCount),
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
              <div className={`carousel-container ${repos.length <= 3 ? 'few-repos' : ''}`}>
                {repos.length <= 3 ? (
                  <div className="static-repos-container">
                    {repos.map((repo) => (
                      <div key={repo.id} className="repo-card">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <Slider {...getSliderSettings(repos.length)}>
                    {repos.map((repo) => (
                      <div key={repo.id} className="repo-card">
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
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default App
