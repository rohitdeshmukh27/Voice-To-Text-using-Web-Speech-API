import { useState, useRef, useEffect } from 'react'
import './App.css'

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function App() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript + ' '
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setTranscript(finalTranscriptRef.current + interimTranscript)
      }

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    } else {
      setError('Speech recognition not supported in this browser')
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError('')
      finalTranscriptRef.current = ''
      setTranscript('')
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    finalTranscriptRef.current = ''
  }

  return (
    <div className="app">
      <h1>Voice to Text</h1>

      <div className="controls">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`mic-button ${isListening ? 'listening' : ''}`}
          disabled={!!error}
        >
          {isListening ? '🛑 Stop' : '🎤 Start'}
        </button>

        <button onClick={clearTranscript} className="clear-button">
          Clear
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="transcript-container">
        <h3>Transcript:</h3>
        <div className="transcript">
          {transcript || 'Click the microphone to start speaking...'}
        </div>
      </div>

      {isListening && <div className="listening-indicator">🎤 Listening...</div>}
    </div>
  )
}

export default App
