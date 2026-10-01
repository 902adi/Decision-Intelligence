import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
import { rivergateWards } from '../../data/rivergate';
import { CloudRain, TrendingUp, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const ForecastView: React.FC = () => {
  const { graph, rainfallMmH } = useAppStore();
  const { language } = useI18n();

  // Prepare chart data for rainfall projection
  const forecastData = [0, 1, 2, 3, 4, 5, 6].map((t) => ({
    time: `T+${t}h`,
    precipitation: Math.round(rainfallMmH * (1 + t * 0.12)),
    riverRise: Number((graph.riverLevelRiseMeters * (1 + t * 0.15)).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text">
            Meteorological & Hydrological Forecast
          </h2>
          <p className="text-xs text-text-2">
            6-Hour Forward Projection from Sensor Mesh & Open-Meteo Integration
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-5 rounded-panel bg-surface border border-line space-y-4 shadow-calm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text uppercase tracking-wider">
            Precipitation & River Surge Velocity
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              Precipitation (mm/h)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--text-2)" fontSize={11} />
              <YAxis stroke="var(--text-2)" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'var(--line)', 
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '12px' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="precipitation" 
                stroke="var(--accent)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#precipGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward Risk Matrix Table (T+0 to T+6) */}
      <div className="p-5 rounded-panel bg-surface border border-line space-y-3 shadow-calm overflow-x-auto">
        <span className="text-xs font-semibold text-text uppercase tracking-wider block">
          Ward Risk Timeline Matrix (T+0h to T+6h)
        </span>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-line text-text-2 font-mono">
              <th className="py-2 pr-3">Ward</th>
              <th className="py-2 px-2">Elev.</th>
              <th className="py-2 px-2">T+0</th>
              <th className="py-2 px-2">T+1</th>
              <th className="py-2 px-2">T+2</th>
              <th className="py-2 px-2">T+3</th>
              <th className="py-2 px-2">T+4</th>
              <th className="py-2 px-2">T+5</th>
              <th className="py-2 px-2">T+6</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 font-mono">
            {rivergateWards.map((w) => {
              const wr = graph.wardRisks[w.id];
              const wardTitle = language === 'hi' ? w.nameHi : language === 'mr' ? w.nameMr : w.name;
              return (
                <tr key={w.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-2.5 pr-3 font-sans font-medium text-text">
                    W{w.number}: {wardTitle}
                  </td>
                  <td className="py-2.5 px-2 text-text-2">{w.elevation}m</td>
                  {wr?.timeline.map((score, idx) => {
                    const color = 
                      score >= 80 ? 'text-crit font-bold' :
                      score >= 60 ? 'text-high font-semibold' :
                      score >= 30 ? 'text-mod' : 'text-low';
                    return (
                      <td key={idx} className={`py-2.5 px-2 ${color}`}>
                        {score}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
