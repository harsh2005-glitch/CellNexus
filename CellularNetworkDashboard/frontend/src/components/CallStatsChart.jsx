import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Chart palette — matches Pearl Indigo theme
const COLORS = {
  indigo:  '#4F46E5',
  violet:  '#7C3AED',
  cyan:    '#0891B2',
  sky:     '#38BDF8',
  amber:   '#D97706',
  red:     '#DC2626',
  rose:    '#E11D48',
  emerald: '#059669',
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(99,102,241,0.30)', borderRadius: '10px',
        padding: '10px 14px', boxShadow: '0 8px 24px rgba(79,70,229,0.15)',
        fontSize: '0.72rem', minWidth: '140px',
      }}>
        <p style={{ color: COLORS.indigo, fontWeight: '700', marginBottom: '6px', borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: '5px' }}>Connects</p>
        <p style={{ color: COLORS.indigo, marginBottom: '2px' }}>New: <b>{d.answeredNew}</b></p>
        <p style={{ color: COLORS.cyan, marginBottom: '8px' }}>Handoff: <b>{d.answeredHandoff}</b></p>
        <p style={{ color: COLORS.red, fontWeight: '700', marginBottom: '6px', borderBottom: '1px solid rgba(220,38,38,0.12)', paddingBottom: '5px' }}>Failures</p>
        <p style={{ color: COLORS.amber, marginBottom: '2px' }}>Blocked: <b>{d.blockedNew}</b></p>
        <p style={{ color: COLORS.red }}>Dropped: <b>{d.droppedHandoff}</b></p>
      </div>
    );
  }
  return null;
};

const CallStatsChart = ({ towerId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([]);
    const fetchTelemetries = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/towers/${towerId}/telemetry`);
        const formattedData = res.data.map((t) => {
          const date = new Date(t.timestamp);
          const timeLabel = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

          const totalIncoming = t.callTotal || 0;
          const totalAnswered = t.callAccepted || 0;
          const answerRate = totalIncoming > 0 ? totalAnswered / totalIncoming : 1;
          const incomingNew = totalIncoming * 0.7;
          const incomingHandoff = totalIncoming * 0.3;
          const answeredNew = Math.round(incomingNew * answerRate);
          const answeredHandoff = Math.round(incomingHandoff * answerRate);
          const blockedNew = Math.max(0, Math.round(incomingNew) - answeredNew);
          const droppedHandoff = Math.max(0, Math.round(incomingHandoff) - answeredHandoff);
          const blockingProb = incomingNew > 0 ? blockedNew / incomingNew : 0;
          const droppingProb = Math.min(1, Math.max(0, incomingHandoff > 0 ? droppedHandoff / incomingHandoff : 0));
          const totalCalls = incomingNew + incomingHandoff;
          const totalFailed = blockedNew + droppedHandoff;
          const throughputVal = totalCalls > 0 ? Math.max(0, Math.min(100, ((totalCalls - totalFailed) / totalCalls) * 100)) : 100;

          return { answeredNew, answeredHandoff, blockedNew, droppedHandoff, blockingProb, droppingProb, throughputVal, responseTime: t.latency || 0, timeFormatted: timeLabel };
        });
        setData(formattedData);
      } catch (error) {
        console.error('Failed to fetch telemetries', error);
      }
    };

    fetchTelemetries();
    const interval = setInterval(fetchTelemetries, 3000);
    return () => clearInterval(interval);
  }, [towerId]);

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ color: '#6B7DB3', fontSize: '0.85rem' }}>
        Initializing 60s stream...
      </div>
    );
  }

  const latestPoint = data[data.length - 1] || {};
  const blockingRaw    = (latestPoint.blockingProb  || 0).toFixed(4);
  const droppingRaw    = (latestPoint.droppingProb  || 0).toFixed(4);
  const throughputPercent = (latestPoint.throughputVal ?? 100).toFixed(1);
  const isDangerDrop   = (latestPoint.droppingProb  || 0) > 0.10;

  // Shared KPI card style
  const kpiCard = (accent, danger = false) => ({
    background: danger
      ? `rgba(${accent === 'red' ? '220,38,38' : '220,38,38'},0.08)`
      : 'rgba(255,255,255,0.82)',
    border: `1px solid rgba(${
      accent === 'amber'   ? '217,119,6'  :
      accent === 'red'     ? '220,38,38'  :
      accent === 'cyan'    ? '8,145,178'  :
      accent === 'indigo'  ? '79,70,229'  :
      accent === 'emerald' ? '5,150,105'  : '79,70,229'
    },0.30)`,
    borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '10px 8px', position: 'relative', overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 2px 10px rgba(79,70,229,0.07)',
  });

  const kpiLabel = (accent) => ({
    fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.03em',
    color: accent === 'amber'   ? '#92400E' :
           accent === 'red'     ? '#7F1D1D' :
           accent === 'cyan'    ? '#164E63' :
           accent === 'emerald' ? '#064E3B' :
           '#3730A3',
    marginBottom: '3px', zIndex: 1,
  });

  const kpiValue = (accent, danger = false) => ({
    fontSize: '1.35rem', fontWeight: '800', fontFamily: 'monospace', zIndex: 1,
    color: danger ? COLORS.red :
           accent === 'amber'   ? COLORS.amber   :
           accent === 'red'     ? COLORS.red     :
           accent === 'cyan'    ? COLORS.cyan     :
           accent === 'emerald' ? COLORS.emerald  :
           COLORS.indigo,
  });

  const progressBar = (accent, width) => ({
    position: 'absolute', bottom: 0, left: 0, height: '3px',
    width: `${width}%`,
    background: accent === 'amber'   ? COLORS.amber   :
                accent === 'red'     ? COLORS.red     :
                accent === 'cyan'    ? COLORS.cyan     :
                accent === 'emerald' ? COLORS.emerald  : COLORS.indigo,
    borderRadius: '0 2px 0 0',
    transition: 'width 0.4s ease',
    opacity: 0.65,
  });

  return (
    <div className="h-full w-full mt-2 flex flex-col">
      {/* ── Chart ── */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 15, bottom: 20 }}>
            <defs>
              <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.indigo} stopOpacity={0.40} />
                <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.cyan} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.amber} stopOpacity={0.45} />
                <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.red} stopOpacity={0.45} />
                <stop offset="95%" stopColor={COLORS.red} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Grid — light indigo dots */}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.15)" vertical={false} />

            <XAxis
              dataKey="timeFormatted"
              stroke="#6B7DB3"
              fontSize={10}
              tickMargin={10}
              minTickGap={30}
              label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#6B7DB3', fontSize: 11 }}
            />
            <YAxis
              stroke="#6B7DB3"
              fontSize={10}
              label={{ value: 'Number of Calls', angle: -90, position: 'insideLeft', offset: 12, fill: '#6B7DB3', fontSize: 11, style: { textAnchor: 'middle' } }}
            />
            <Tooltip
              content={<CustomTooltip />}
              offset={40}
              cursor={{ stroke: 'rgba(99,102,241,0.35)', strokeWidth: 1.5, strokeDasharray: '4 3' }}
            />

            {/* Connects — indigo + cyan */}
            <Area stackId="connects" type="monotone" dataKey="answeredNew"     name="Ans New"    stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#gradIndigo)" isAnimationActive={false} />
            <Area stackId="connects" type="monotone" dataKey="answeredHandoff" name="Ans Handoff" stroke={COLORS.cyan}   strokeWidth={1.5} fillOpacity={1} fill="url(#gradCyan)"   isAnimationActive={false} />

            {/* Failures — amber + red */}
            <Area stackId="failures" type="monotone" dataKey="blockedNew"     name="Blocked" stroke={COLORS.amber} strokeWidth={1.5} fillOpacity={1} fill="url(#gradAmber)" isAnimationActive={false} />
            <Area stackId="failures" type="monotone" dataKey="droppedHandoff" name="Dropped" stroke={COLORS.red}   strokeWidth={1.5} fillOpacity={1} fill="url(#gradRed)"   isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── KPI Cards 2×2 ── */}
      <div className="shrink-0 mt-2 px-1 pb-1 grid grid-cols-2 gap-2">

        {/* Blocking Probability */}
        <div style={kpiCard('amber')}>
          <div style={kpiLabel('amber')}>Blocking Probability</div>
          <div style={kpiValue('amber')}>{blockingRaw}</div>
          <div style={progressBar('amber', (latestPoint.blockingProb || 0) * 100)} />
        </div>

        {/* Dropping Probability */}
        <div style={kpiCard('red', isDangerDrop)}>
          <div style={{ ...kpiLabel('red'), display: 'flex', alignItems: 'center', gap: '5px' }}>
            Dropping Probability
            {isDangerDrop && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.red, display: 'inline-block', animation: 'pulse 1s infinite' }} />}
          </div>
          <div style={kpiValue('red', isDangerDrop)}>{droppingRaw}</div>
          <div style={progressBar('red', (latestPoint.droppingProb || 0) * 100)} />
        </div>

        {/* End-to-End Delay */}
        <div style={kpiCard('cyan')}>
          <div style={kpiLabel('cyan')}>End-to-End Delay</div>
          <div style={kpiValue('cyan')}>{latestPoint.responseTime || 0} <span style={{ fontSize: '0.8rem' }}>ms</span></div>
          <div style={progressBar('cyan', Math.min((latestPoint.responseTime || 0) / 2, 100))} />
        </div>

        {/* Throughput */}
        <div style={kpiCard(isDangerDrop ? 'red' : 'emerald', isDangerDrop)}>
          <div style={{ ...kpiLabel(isDangerDrop ? 'red' : 'emerald'), display: 'flex', alignItems: 'center', gap: '5px' }}>
            Throughput
            {isDangerDrop && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.red, display: 'inline-block', animation: 'pulse 1s infinite' }} />}
          </div>
          <div style={kpiValue(isDangerDrop ? 'red' : 'emerald', isDangerDrop)}>{throughputPercent}<span style={{ fontSize: '0.8rem' }}>%</span></div>
          <div style={progressBar(isDangerDrop ? 'red' : 'emerald', parseFloat(throughputPercent))} />
        </div>

      </div>
    </div>
  );
};

export default CallStatsChart;
