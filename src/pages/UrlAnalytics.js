import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import {
  Link, Users, Clock, Smartphone, Globe, RefreshCw, MapPin, AlertCircle, Loader2
} from "lucide-react";
import "./modern.css";

// Fallback data structure
const FALLBACK_DATA = {
  originalUrl: "https://example.com/original-url",
  clicks: 1284,
  createdAt: new Date().toISOString(),
  logs: Array.from({ length: 50 }, (_, i) => ({
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    device: ["mobile", "desktop", "tablet"][Math.floor(Math.random() * 3)],
    country: ["US", "IN", "UK", "DE", "FR", "BR", "JP"][Math.floor(Math.random() * 7)],
    city: ["New York", "Mumbai", "London", "Berlin", "Paris", "São Paulo", "Tokyo"][Math.floor(Math.random() * 7)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }))
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UrlAnalytics = ({ shortId = "demo" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      // Try to fetch real data first
      try {
        const res = await axios.get(
          `https://link-shrinker-backend.onrender.com/api/urls/analytics/${shortId}`,
          { timeout: 5000 }
        );
        
        if (res.data?.logs) {
          setData(res.data);
          return;
        }
      } catch (apiError) {
        console.warn("API failed, using fallback data:", apiError.message);
      }

      // If API fails, use fallback data
      setData(FALLBACK_DATA);
      setUsingFallback(true);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load analytics");
      setData(FALLBACK_DATA);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shortId]);

  const processAnalytics = () => {
    if (!data?.logs) return null;

    // Device distribution
    const deviceData = data.logs.reduce((acc, log) => {
      const device = log.device ? log.device.toLowerCase() : 'unknown';
      const normalizedDevice = 
        device.includes('mobile') ? 'Mobile' :
        device.includes('desktop') ? 'Desktop' :
        device.includes('tablet') ? 'Tablet' :
        'Other';
      
      acc[normalizedDevice] = (acc[normalizedDevice] || 0) + 1;
      return acc;
    }, {});

    // Time distribution (last 7 days)
    const now = new Date();
    const timeData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateStr,
        clicks: data.logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return (
            logDate.getDate() === date.getDate() &&
            logDate.getMonth() === date.getMonth() &&
            logDate.getFullYear() === date.getFullYear()
          );
        }).length
      };
    });

    // Country distribution
    const countryData = data.logs.reduce((acc, log) => {
      const country = log.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const sortedCountries = Object.entries(countryData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Browser data (from user agent if available)
    const browserData = data.logs.reduce((acc, log) => {
      const browser = log.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    return {
      originalUrl: data.originalUrl,
      totalClicks: data.clicks,
      uniqueVisitors: new Set(data.logs.map(log => log.ip)).size,
      createdAt: new Date(data.createdAt).toLocaleDateString(),
      deviceData: Object.entries(deviceData).map(([name, value]) => ({ name, value })),
      timeData,
      countryData: sortedCountries,
      browserData: Object.entries(browserData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, value]) => ({ name, value })),
      usingFallback
    };
  };

  const analytics = processAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-600">No analytics data available</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header with warning if using fallback */}
      {analytics.usingFallback && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            <p className="text-yellow-700">
              Showing demo data. The analytics API is currently unavailable.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link className="text-blue-500" /> URL Analytics
          </h1>
          <p className="text-gray-600">
            {analytics.originalUrl}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="text-blue-500" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Total Clicks</h3>
              <p className="text-2xl font-bold">{analytics.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Globe className="text-green-500" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Unique Visitors</h3>
              <p className="text-2xl font-bold">{analytics.uniqueVisitors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-500" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Created</h3>
              <p className="text-2xl font-bold">{analytics.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <MapPin className="text-red-500" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Countries</h3>
              <p className="text-2xl font-bold">{analytics.countryData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Clicks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
            <Clock size={18} /> Daily Clicks (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
            <Smartphone size={18} /> Device Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
          <Globe size={18} /> Top Countries
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.countryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.countryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} clicks`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
          <MapPin size={18} /> Recent Activity
        </h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.logs.slice(0, 5).map((log, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.city}, {log.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {log.device}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UrlAnalytics;
