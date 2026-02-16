import { useState, useEffect } from 'react'
import './index.css'
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sun, 
  Moon, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Calendar,
  Bell,
  Activity
} from 'lucide-react'

// Market hours (CT)
const MARKET_OPEN_HOUR = 8
const MARKET_OPEN_MINUTE = 30
const MARKET_CLOSE_HOUR = 15
const MARKET_CLOSE_MINUTE = 0

const WATCHLIST = [
  { ticker: 'NVDA', name: 'NVIDIA', price: 875.42, change: 2.34 },
  { ticker: 'TSLA', name: 'Tesla', price: 178.32, change: -1.12 },
  { ticker: 'AAPL', name: 'Apple', price: 185.92, change: 0.56 },
  { ticker: 'MSFT', name: 'Microsoft', price: 415.13, change: 1.23 },
  { ticker: 'META', name: 'Meta', price: 498.73, change: 3.45 },
]

const EARNINGS = [
  { ticker: 'WIX', date: 'Today', time: 'BMO' },
  { ticker: 'VAL', date: 'Tomorrow', time: 'BMO' },
  { ticker: 'AXTI', date: 'Tomorrow', time: 'AMC' },
]

const CHECKLIST_ITEMS = [
  'Check SPY/QQQ 10/20 MA alignment',
  'Review momentum scans (1m/3m/6m leaders)',
  'Check earnings calendar for open positions',
  'Identify 4-5 star setup candidates',
  'Set alerts at breakout levels',
]

function App() {
  const [now, setNow] = useState(new Date())
  const [regime, setRegime] = useState<'ON' | 'OFF'>('OFF')
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(5).fill(false))

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getMarketStatus = () => {
    const hour = now.getHours()
    const minute = now.getMinutes()
    const day = now.getDay()
    
    if (day === 0 || day === 6) return 'CLOSED'
    
    const currentTime = hour * 60 + minute
    const openTime = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE
    const closeTime = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE
    
    if (currentTime < openTime) return 'PRE_MARKET'
    if (currentTime >= openTime && currentTime < closeTime) return 'OPEN'
    return 'CLOSED'
  }

  const marketStatus = getMarketStatus()

  const getCountdown = () => {
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour * 60 + minute
    
    if (marketStatus === 'OPEN') {
      const closeTime = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE
      const diff = closeTime - currentTime
      return { hours: Math.floor(diff / 60), minutes: diff % 60, seconds: 60 - now.getSeconds(), label: 'Closes In' }
    }
    
    if (marketStatus === 'PRE_MARKET') {
      const openTime = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE
      const diff = openTime - currentTime
      return { hours: Math.floor(diff / 60), minutes: diff % 60, seconds: 60 - now.getSeconds(), label: 'Opens In' }
    }
    
    let nextOpen = new Date(now)
    nextOpen.setDate(nextOpen.getDate() + 1)
    nextOpen.setHours(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, 0, 0)
    
    if (now.getDay() === 5) {
      nextOpen.setDate(nextOpen.getDate() + 2)
    }
    
    const diff = Math.floor((nextOpen.getTime() - now.getTime()) / 1000)
    return { 
      hours: Math.floor(diff / 3600), 
      minutes: Math.floor((diff % 3600) / 60), 
      seconds: diff % 60,
      label: 'Next Open' 
    }
  }

  const countdown = getCountdown()

  const toggleRegime = () => setRegime(prev => prev === 'ON' ? 'OFF' : 'ON')

  const toggleChecklistItem = (index: number) => {
    setCheckedItems(prev => prev.map((checked, i) => i === index ? !checked : checked))
  }

  const checkedCount = checkedItems.filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Market Clock</h1>
                <p className="text-[10px] text-gray-500">QullaBot Trading</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} CT
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Market Status Card */}
        <div className={`rounded-2xl p-5 ${
          marketStatus === 'OPEN' ? 'bg-gradient-to-br from-green-600 to-green-700' :
          marketStatus === 'PRE_MARKET' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' :
          'bg-gradient-to-br from-gray-700 to-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {marketStatus === 'OPEN' ? <Sun className="w-6 h-6" /> :
                 marketStatus === 'PRE_MARKET' ? <Clock className="w-6 h-6" /> :
                 <Moon className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Market {marketStatus === 'OPEN' ? 'Open' : marketStatus === 'PRE_MARKET' ? 'Pre-Market' : 'Closed'}</p>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}
                  <span className="text-lg text-white/60">:{String(countdown.seconds).padStart(2, '0')}</span>
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-3">{countdown.label} • 8:30 AM – 3:00 PM CT</p>
        </div>

        {/* Regime Status */}
        <div className={`rounded-2xl p-5 ${
          regime === 'ON' ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-red-600 to-rose-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {regime === 'ON' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">Regime</p>
                <p className="text-xl font-bold">{regime === 'ON' ? 'BREAKOUT ON' : 'BREAKOUT OFF'}</p>
              </div>
            </div>
            <button
              onClick={toggleRegime}
              className="text-[10px] px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              Demo
            </button>
          </div>
          
          <div className="flex items-start gap-2 text-sm bg-black/20 rounded-xl p-3">
            {regime === 'ON' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>SPY/QQQ 10/20 MA rising. Full offense. Look for 4-5 star breakouts.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>SPY/QQQ below MAs or falling. Defensive. No new long breakouts.</span>
              </>
            )}
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm">Watchlist</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {WATCHLIST.map(stock => (
              <div key={stock.ticker} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">{stock.ticker[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{stock.ticker}</p>
                    <p className="text-xs text-gray-500">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${stock.price.toFixed(2)}</p>
                  <p className={`text-xs flex items-center justify-end gap-0.5 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <h2 className="font-semibold text-sm">Earnings</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {EARNINGS.map(item => (
              <div key={item.ticker} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{item.ticker}</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                  item.time === 'BMO' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h2 className="font-semibold text-sm">Pre-Market Checklist</h2>
            </div>
            <span className="text-xs text-gray-500">{checkedCount}/5</span>
          </div>
          <div className="p-2 space-y-1">
            {CHECKLIST_ITEMS.map((item, i) => (
              <label 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  checkedItems[i] 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-600'
                }`}>
                  {checkedItems[i] && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={checkedItems[i]}
                  onChange={() => toggleChecklistItem(i)}
                />
                <span className={`text-sm ${checkedItems[i] ? 'text-gray-500 line-through' : ''}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Daily Prep Progress</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(checkedCount / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {checkedCount === 5 ? 'All set! Ready to trade.' : `${5 - checkedCount} items remaining`}
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
