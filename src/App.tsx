import { useEffect, useState } from 'react'
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
  const githubUsername = "Zetic"; // Updated with your GitHub username

  useEffect(() => {
    // Fetch public repositories from GitHub API
    fetch(`https://api.github.com/users/${githubUsername}/repos`)
      .then((res) => res.json())
      .then((data) => setRepos(data));
  }, []);

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '10px',
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
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

  return (
    <div className="container">
      <header>
        <h1>Your Name</h1>
        <p>Welcome to my portfolio! Here are my public GitHub repositories:</p>
      </header>
      <section>
        <h2>Repositories</h2>
        {repos.length === 0 ? (
          <div className="loading">Loading repositories...</div>
        ) : (
          <div className="carousel-container">
            <Slider {...sliderSettings}>
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
          </div>
        )}
      </section>
    </div>
  );
}

export default App
