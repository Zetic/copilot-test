import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const githubUsername = "Zetic"; // Updated with your GitHub username

  useEffect(() => {
    // Fetch public repositories from GitHub API
    fetch(`https://api.github.com/users/${githubUsername}/repos`)
      .then((res) => res.json())
      .then((data) => setRepos(data));
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Your Name</h1>
        <p>Welcome to my portfolio! Here are my public GitHub repositories:</p>
      </header>
      <section>
        <h2>Repositories</h2>
        <ul>
          {repos.length === 0 ? (
            <li>Loading repositories...</li>
          ) : (
            repos.map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
                <p>{repo.description}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

export default App
