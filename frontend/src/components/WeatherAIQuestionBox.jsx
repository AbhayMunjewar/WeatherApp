import React, { useState, useMemo } from 'react';
import { Send, Lightbulb, AlertCircle } from 'lucide-react';

/**
 * WeatherAIQuestionBox Component
 * Features:
 * - User can ask simple weather-related questions
 * - Rule-based AI logic for responses
 * - Contextual advice based on weather conditions
 * - Example suggestions
 */

const WeatherAIQuestionBox = ({ 
  weatherData,
  forecastData
}) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hi! Ask me anything about the weather. Try: "Should I go outside?" or "What should I wear?"',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Rule-based AI logic
  const generateResponse = useMemo(() => {
    return (userQuestion) => {
      if (!weatherData) {
        return 'Please load weather data first to get recommendations.';
      }

      const q = userQuestion.toLowerCase().trim();
      const temp = weatherData.main?.temp || 0;
      const humidity = weatherData.main?.humidity || 0;
      const condition = (weatherData.weather?.[0]?.main || '').toLowerCase();
      const windSpeed = weatherData.wind?.speed || 0;
      const isRaining = condition.includes('rain');
      const isCloudy = condition.includes('cloud');
      const isSnowy = condition.includes('snow');

      // Question: Should I go outside?
      if (q.includes('go outside') || q.includes('should i be outside')) {
        if (isRaining && windSpeed > 10) {
          return '⚠️ Not recommended right now. Heavy rain and strong winds outside. Better to stay indoors.';
        }
        if (temp < -5) {
          return '❄️ It\'s extremely cold! Only go out if necessary, and dress very warmly.';
        }
        if (temp < 0 && isSnowy) {
          return '❄️ Snowy and cold conditions. Wear snow boots and layer up!';
        }
        if (isRaining) {
          return '🌧️ It\'s raining, so bring an umbrella! Otherwise, you can go out.';
        }
        if (temp > 25 && humidity > 80) {
          return '☀️ It\'s hot and humid. Stay hydrated and apply sunscreen!';
        }
        return '✅ Great day to go outside! Enjoy the weather.';
      }

      // Question: What should I wear?
      if (q.includes('what should i wear') || q.includes('wear') || q.includes('clothes')) {
        let outfit = '';
        
        if (temp < -10) {
          outfit = '❄️ Heavy winter coat, thermal layers, winter boots, warm hat, and gloves.';
        } else if (temp < 0) {
          outfit = '❄️ Winter coat, warm layers, boots, hat, and mittens.';
        } else if (temp < 10) {
          outfit = '🧥 Light jacket or sweater, jeans, closed shoes.';
        } else if (temp < 20) {
          outfit = '👕 Long-sleeve shirt or light sweater, comfortable pants.';
        } else if (temp < 25) {
          outfit = '👕 T-shirt or light top, shorts or light pants.';
        } else {
          outfit = '🩱 Light clothing, shorts, t-shirt. Don\'t forget sunscreen!';
        }

        if (isRaining) {
          outfit += ' 🌧️ Also bring a waterproof jacket or umbrella.';
        }
        if (windSpeed > 15) {
          outfit += ' 💨 It\'s windy—wear something wind-resistant.';
        }

        return outfit;
      }

      // Question: Will it rain?
      if (q.includes('rain') || q.includes('rainy')) {
        if (isRaining) {
          return '🌧️ Yes, it\'s already raining right now!';
        }
        if (forecastData && forecastData.length > 0) {
          const nextRain = forecastData.some(f => 
            f.weather?.[0]?.main.toLowerCase().includes('rain')
          );
          if (nextRain) {
            return '☔ Rain expected in the next few days. Keep an umbrella handy!';
          }
        }
        return '✅ No rain expected!';
      }

      // Question: Is it cold?
      if (q.includes('cold') || q.includes('freezing') || q.includes('temperature')) {
        if (temp < -5) {
          return `❄️ Yes, it\'s extremely cold at ${temp}°C! Bundle up!`;
        }
        if (temp < 0) {
          return `❄️ Yes, it\'s freezing at ${temp}°C. Wear winter clothes.`;
        }
        if (temp < 10) {
          return `🧥 It\'s cool at ${temp}°C. A light jacket would be good.`;
        }
        return `🌡️ It\'s ${temp}°C—not too cold, quite comfortable.`;
      }

      // Question: Is it hot?
      if (q.includes('hot') || q.includes('warm') || q.includes('heat')) {
        if (temp > 35) {
          return `🔥 Yes, it\'s very hot at ${temp}°C! Stay hydrated and avoid prolonged sun exposure.`;
        }
        if (temp > 25) {
          return `☀️ Yes, it\'s warm at ${temp}°C. Light clothing and sunscreen recommended.`;
        }
        if (temp > 15) {
          return `😊 It\'s pleasant at ${temp}°C—mild and comfortable.`;
        }
        return `🌡️ It\'s ${temp}°C—cool and comfortable.`;
      }

      // Question: What's the humidity?
      if (q.includes('humid') || q.includes('humidity')) {
        if (humidity > 80) {
          return `💧 Very humid at ${humidity}%! You might feel sticky. Stay hydrated.`;
        }
        if (humidity > 60) {
          return `💧 Moderately humid at ${humidity}%. Comfortable for most activities.`;
        }
        return `💧 It\'s ${humidity}% humidity—fairly dry and comfortable.`;
      }

      // Question: Wind information
      if (q.includes('wind') || q.includes('windy')) {
        if (windSpeed > 25) {
          return `💨 Very windy at ${windSpeed} m/s! Secure loose objects and be cautious outdoors.`;
        }
        if (windSpeed > 15) {
          return `💨 Quite windy at ${windSpeed} m/s. Wear wind-resistant clothing.`;
        }
        if (windSpeed > 5) {
          return `🌬️ Breeze of ${windSpeed} m/s—refreshing but not strong.`;
        }
        return `🌬️ Wind at ${windSpeed} m/s—calm conditions.`;
      }

      // Default response
      return '😊 I can help with weather questions! Try asking: "Should I go outside?", "What should I wear?", "Will it rain?", "Is it cold/hot?", or "What\'s the humidity?"';
    };
  }, [weatherData, forecastData]);

  const handleSendQuestion = () => {
    if (!question.trim()) return;

    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate slight delay for natural feel
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(question);
      const botMessage = {
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 300);

    setQuestion('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const quickQuestions = [
    'Should I go outside?',
    'What should I wear?',
    'Will it rain?',
    'Is it cold?'
  ];

  return (
    <div className="glass" style={{
      padding: '1.5rem',
      background: 'rgba(15, 23, 42, 0.5)',
      borderRadius: '1rem',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      maxHeight: '500px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <Lightbulb size={18} color="#fbbf24" />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          margin: 0,
          color: 'white'
        }}>
          Weather Assistant
        </h3>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        minHeight: 0,
        paddingRight: '0.5rem'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '0.5rem'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: msg.type === 'user'
                  ? 'rgba(139, 92, 246, 0.3)'
                  : 'rgba(15, 23, 42, 0.6)',
                border: msg.type === 'user'
                  ? '1px solid rgba(139, 92, 246, 0.5)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
                color: msg.type === 'user' ? '#e9d5ff' : '#cbd5e1',
                fontSize: '0.85rem',
                lineHeight: '1.4'
              }}
            >
              {typeof msg.content === 'string' ? msg.content : String(msg.content || 'No response')}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.85rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#a78bfa',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#a78bfa',
              animation: 'pulse 1.5s ease-in-out 0.2s infinite'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#a78bfa',
              animation: 'pulse 1.5s ease-in-out 0.4s infinite'
            }} />
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {quickQuestions.map((quick, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(quick);
                // Auto-send after setting
                setTimeout(() => {
                  const userMessage = {
                    type: 'user',
                    content: quick,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, userMessage]);
                  setLoading(true);
                  setTimeout(() => {
                    const response = generateResponse(quick);
                    const botMessage = {
                      type: 'bot',
                      content: response,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, botMessage]);
                    setLoading(false);
                  }, 300);
                  setQuestion('');
                }, 50);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                minHeight: '2rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.25)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            >
              {quick}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        paddingTop: '1rem'
      }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          disabled={loading}
          style={{
            flex: 1,
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.6rem 0.8rem',
            color: 'white',
            fontSize: '0.85rem',
            resize: 'none',
            maxHeight: '70px',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'text'
          }}
          rows="2"
        />
        <button
          onClick={handleSendQuestion}
          disabled={!question.trim() || loading}
          style={{
            background: question.trim() && !loading ? '#a78bfa' : '#4b5563',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '0.6rem',
            cursor: question.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: question.trim() && !loading ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (question.trim() && !loading) {
              e.target.style.background = '#c084fc';
            }
          }}
          onMouseLeave={(e) => {
            if (question.trim() && !loading) {
              e.target.style.background = '#a78bfa';
            }
          }}
        >
          <Send size={18} />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default WeatherAIQuestionBox;
