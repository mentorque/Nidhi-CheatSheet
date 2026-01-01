import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';

const CheatSheetList = () => {
  const [cheatsheets, setCheatsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCheatsheets = async () => {
      try {
        // Try to load manifest.json first
        const manifestResponse = await fetch('/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          setCheatsheets(manifest.cheatsheets || []);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('Manifest not found, trying alternative method');
      }

      // Fallback: Try to fetch known cheatsheets
      const knownCheatsheets = ['nidhi-sharma', 'gokul-yadav'];
      const availableCheatsheets = [];

      for (const name of knownCheatsheets) {
        try {
          const response = await fetch(`/${name}.json`, { method: 'HEAD' });
          if (response.ok) {
            availableCheatsheets.push({
              name: name,
              displayName: name.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
            });
          }
        } catch (err) {
          // Skip if not found
        }
      }

      setCheatsheets(availableCheatsheets);
      setLoading(false);
    };

    loadCheatsheets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading cheatsheets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Error loading cheatsheets</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-2xl">Mentorque</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-4">
            Available Cheatsheets
          </h1>
          <p className="text-gray-300 text-lg">
            Click on any cheatsheet to view it
          </p>
        </div>

        {/* List */}
        {cheatsheets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No cheatsheets found</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-400 text-white rounded-xl font-medium hover:bg-blue-500 transition-all duration-300"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cheatsheets.map((cheatsheet) => (
              <a
                key={cheatsheet.name}
                href={`/${cheatsheet.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {cheatsheet.displayName || cheatsheet.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {cheatsheet.name}.json
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetList;

