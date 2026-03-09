import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Loader2, Navigation, Clock } from 'lucide-react';

const AddressAutocomplete = ({
  onSelect,
  placeholder = 'Search for an address...',
  initialValue = '',
  className = '',
  darkMode = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kaajlink_recent_addresses') || '[]');
      setRecentSearches(saved.slice(0, 5));
    } catch { }
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Nominatim search
  const searchAddress = useCallback((searchQuery) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&addressdetails=1&countrycodes=in`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        const data = await response.json();

        const formatted = data.map((item) => ({
          id: item.place_id,
          name: item.display_name.split(',').slice(0, 2).join(', '),
          fullAddress: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
          city: item.address?.city || item.address?.town || item.address?.village || '',
          state: item.address?.state || '',
        }));

        setResults(formatted);
      } catch (err) {
        console.error('Nominatim search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    searchAddress(value);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    setResults([]);

    // Save to recent searches
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('kaajlink_recent_addresses', JSON.stringify(updated));
    } catch { }

    if (onSelect) {
      onSelect({
        address: item.fullAddress,
        shortAddress: item.name,
        lat: item.lat,
        lng: item.lng,
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setShowDropdown(false);

    // Use watchPosition for progressive accuracy improvement
    let bestAccuracy = Infinity;
    let bestCoords = null;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Keep the most accurate reading
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestCoords = { lat: latitude, lng: longitude };
        }

        // Accept if accuracy is good enough (< 100m) or wait for timeout
        if (accuracy <= 100) {
          navigator.geolocation.clearWatch(watchId);
          await applyDetectedLocation(bestCoords);
        }
      },
      async () => {
        navigator.geolocation.clearWatch(watchId);
        // Fallback: try IP-based geolocation
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            await applyDetectedLocation({ lat: ipData.latitude, lng: ipData.longitude });
            return;
          }
        } catch {}
        alert('Unable to get your location. Please type your address instead.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );

    // After 8s, use best result so far even if not ideal
    setTimeout(async () => {
      navigator.geolocation.clearWatch(watchId);
      if (bestCoords && loading) {
        await applyDetectedLocation(bestCoords);
      }
    }, 8000);
  };

  const applyDetectedLocation = async (coords) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      );
      const data = await res.json();
      const shortName = data.display_name?.split(',').slice(0, 2).join(', ') || 'Current Location';

      setQuery(shortName);
      if (onSelect) {
        onSelect({
          address: data.display_name || 'Current Location',
          shortAddress: shortName,
          lat: coords.lat,
          lng: coords.lng,
        });
      }
    } catch {
      setQuery('Current Location');
      if (onSelect) {
        onSelect({
          address: 'Current Location',
          shortAddress: 'Current Location',
          lat: coords.lat,
          lng: coords.lng,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const bg = darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-text-primary';
  const placeholder_c = darkMode ? 'placeholder:text-gray-400' : 'placeholder:text-gray-400';
  const dropdownBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const dropdownBorder = darkMode ? 'border-gray-700' : 'border-gray-100';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const subText = darkMode ? 'text-gray-400' : 'text-text-secondary';

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative flex items-center">
        <div className={`absolute left-4 ${subText}`}>
          <Search size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className={`w-full h-14 pl-12 pr-12 ${bg} text-sm md:text-base ${text} ${placeholder_c} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border ${border} rounded-2xl transition-all shadow-sm`}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-4 ${subText} hover:text-red-400 transition-colors`}
          >
            <X size={18} />
          </button>
        )}
        {loading && (
          <div className="absolute right-12">
            <Loader2 size={16} className="animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute z-[1000] w-full mt-2 ${dropdownBg} border ${dropdownBorder} rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto`}
        >
          {/* Use current location */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className={`w-full flex items-center gap-3 px-4 py-3.5 ${hoverBg} transition-colors border-b ${dropdownBorder}`}
          >
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Navigation size={16} className="text-blue-500" />
            </div>
            <div className="text-left">
              <p className={`text-sm font-semibold ${text}`}>Use Current Location</p>
              <p className={`text-xs ${subText}`}>Detect via GPS</p>
            </div>
          </button>

          {/* Search results */}
          {results.length > 0 && (
            <div>
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-start gap-3 px-4 py-3 ${hoverBg} transition-colors border-b ${dropdownBorder} last:border-b-0`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-sm font-medium ${text} truncate`}>{item.name}</p>
                    <p className={`text-xs ${subText} truncate mt-0.5`}>
                      {item.city && `${item.city}, `}{item.state}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {results.length === 0 && !loading && recentSearches.length > 0 && (
            <div>
              <p className={`px-4 pt-3 pb-1.5 text-xs font-semibold ${subText} uppercase tracking-wider`}>
                Recent
              </p>
              {recentSearches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-start gap-3 px-4 py-3 ${hoverBg} transition-colors border-b ${dropdownBorder} last:border-b-0`}
                >
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-sm font-medium ${text} truncate`}>{item.name}</p>
                    <p className={`text-xs ${subText} truncate mt-0.5`}>
                      {item.city && `${item.city}, `}{item.state}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 3 && results.length === 0 && !loading && (
            <div className="px-4 py-6 text-center">
              <p className={`text-sm ${subText}`}>No places found for "{query}"</p>
              <p className={`text-xs ${subText} mt-1`}>Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
