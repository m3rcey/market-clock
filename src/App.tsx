import { useState, useEffect } from 'react'
import './index.css'
import { Clock, TrendingUp, TrendingDown, Sun, Moon, AlertTriangle, CheckCircle, Target } from 'lucide-react'

// Market hours (CT)
const MARKET_OPEN_HOUR = 8  // 8:30 AM CT = 9:30 AM ET
const MARKET_OPEN_MINUTE = 30
const MARKET_CLOSE_HOUR = 15  // 3:00 PM CT = 4:00 PM ET
const MARKET_CLOSE_MINUTE = 0

// Mock watchlist - in real app this would be fetched
const WATCHLIST = [
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.42, change: 2.34 },
  { ticker: 'TSLA', name: 'Tesla', price: 178.32, change: -1.12 },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, change: 0.56 },
  { ticker: 'MSFT', name: 'Microsoft', price: 415.13, change: 1.23 },
  { ticker: 'META', name: 'Meta', price: 498.73, change: 3.45 },
]

// Earnings calendar (mock)
const EARNINGS = [
  { ticker: 'WIX', date: 'Today', time: 'BMO' },
  { ticker: 'VAL', date: 'Tomorrow', time: 'BMO' },
  { ticker: 'AXTI', date: 'Tomorrow', time: 'AMC' },
]

function App() {
  const [now, setNow] = useState(new Date())
  const [regime, setRegime] = useState<'ON' | 'OFF'>('OFF')

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Check market status
  const getMarketStatus = () => {
    const hour = now.getHours()
    const minute = now.getMinutes()
    const day = now.getDay()
    
    // Weekend
    if (day === 0 || day === 6) return 'CLOSED'
    
    const currentTime = hour * 60 + minute
    const openTime = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE
    const closeTime = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE
    
    if (currentTime < openTime) return 'PRE_MARKET'
    if (currentTime >= openTime && currentTime < closeTime) return 'OPEN'
    return 'CLOSED'
  }

  const marketStatus = getMarketStatus()

  // Calculate countdown
  const getCountdown = () => {
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour * 60 + minute
    
    if (marketStatus === 'OPEN') {
      const closeTime = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE
      const diff = closeTime - currentTime
      return { hours: Math.floor(diff / 60), minutes: diff % 60, label: 'Market Closes In' }
    }
    
    if (marketStatus === 'PRE_MARKET') {
      const openTime = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE
      const diff = openTime - currentTime
      return { hours: Math.floor(diff / 60), minutes: diff % 60, label: 'Market Opens In' }
    }
    
    // Next open (tomorrow or Monday)
    let nextOpen = new Date(now)
    nextOpen.setDate(nextOpen.getDate() + 1)
    nextOpen.setHours(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, 0, 0)
    
    // If Friday, next is Monday
    if (now.getDay() === 5) {
      nextOpen.setDate(nextOpen.getDate() + 2)
    }
    
    const diff = Math.floor((nextOpen.getTime() - now.getTime()) / (1000 * 60))
    return { hours: Math.floor(diff / 60), minutes: diff % 60, label: 'Next Open In' }
  }

  const countdown = getCountdown()

  // QullaBot regime check (mock - in real app would fetch SPY/QQQ data)
  const toggleRegime = () => setRegime(prev => prev === 'ON' ? 'OFF' : 'ON')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Market Clock</h1>
                <p className="text-xs text-gray-400">Trading Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} CT</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Market Status Card */}
        <div className={`rounded-xl p-6 ${
          marketStatus === 'OPEN' ? 'bg-green-600' :
          marketStatus === 'PRE_MARKET' ? 'bg-yellow-600' :
          'bg-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {marketStatus === 'OPEN' ? <Sun className="w-8 h-8" /> :
               marketStatus === 'PRE_MARKET' ? <Clock className="w-8 h-8" /> :
               <Moon className="w-8 h-8" />}
              <div>
                <p className="text-sm opacity-80">Market Status</p>
                <p className="text-3xl font-bold">
                  {marketStatus === 'OPEN' ? 'OPEN' :
                   marketStatus === 'PRE_MARKET' ? 'PRE-MARKET' :
                   'CLOSED'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">{countdown.label}</p>
              <p className="text-4xl font-bold">
                {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between text-sm opacity-80">
            <span>Opens: 8:30 AM CT</span>
            <span>Closes: 3:00 PM CT</span>
          </div>
        </div>

        {/* QullaBot Regime Status */}
        <div className={`rounded-xl p-6 ${
          regime === 'ON' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {regime === 'ON' ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              <div>
                <p className="text-sm opacity-80">QullaBot Regime</p>
                <p className="text-3xl font-bold">{regime === 'ON' ? 'BREAKOUT ON' : 'BREAKOUT OFF'}</p>
              </div>
            </div>
            <button
              onClick={toggleRegime}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Toggle (Demo)
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <p className="text-sm">
              {regime === 'ON' 
                ? '✓ SPY/QQQ 10/20 MA rising. Full offense. Look for 4-5 star breakouts.'
                : '✗ SPY/QQQ below MAs or falling. Defensive. No new long breakouts.'}
            </p>
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Watchlist
          </h2>
          <div className="space-y-2">
            {WATCHLIST.map(stock => (
              <div key={stock.ticker} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-bold">{stock.ticker}</p>
                  <p className="text-xs text-gray-400">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <p className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Calendar */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Earnings Calendar</h2>
          <div className="space-y-2">
            {EARNINGS.map(item => (
              <div key={item.ticker} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{item.ticker}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.time === 'BMO' ? 'bg-yellow-600' : 'bg-blue-600'
                }`}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Checklist */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Pre-Market Checklist</h2>
          <div className="space-y-3">
            {[
              'Check SPY/QQQ 10/20 MA alignment',
              'Review momentum scans (1m/3m/6m leaders)',
              'Check earnings calendar for open positions',
              'Identify 4-5 star setup candidates',
              'Set alerts at breakout levels',
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-600 bg-gray-600" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
