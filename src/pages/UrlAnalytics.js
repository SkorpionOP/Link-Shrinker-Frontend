import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import {
  Link, Users, Clock, Smartphone, Globe, RefreshCw, MapPin, AlertCircle, Loader2
} from "lucide-react";

import "./Analytics.css";

// Custom styles (unchanged)
const styles = {
  container: "max-w-7xl mx-auto p-4 space-y-6 bg-gray-100 min-h-screen",
  alertBanner: "bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded",
  header: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
  title: "text-2xl font-bold flex items-center gap-2",
  subtitle: "text-gray-600",
  button: "flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
  cardGrid: "grid grid-cols-1 md:grid-cols-4 gap-4",
  card: "bg-white p-6 rounded-lg shadow",
  cardContent: "flex items-center gap-3",
  cardLabel: "text-gray-500 text-sm",
  cardValue: "text-2xl font-bold",
  chartGrid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  chartCard: "bg-white p-6 rounded-lg shadow",
  chartTitle: "flex items-center gap-2 text-lg font-medium mb-4",
  chartContainer: "h-80",
  fullWidthCard: "bg-white p-6 rounded-lg shadow",
  tableContainer: "bg-white p-6 rounded-lg shadow overflow-x-auto",
  table: "min-w-full divide-y divide-gray-200",
  tableHeader: "bg-gray-50",
  tableHeaderCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tableBody: "bg-white divide-y divide-gray-200",
  tableCell: "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
  loadingContainer: "flex flex-col items-center justify-center h-64 gap-4",
  loadingIcon: "animate-spin h-12 w-12 text-blue-500",
  loadingText: "text-gray-600",
  errorContainer: "flex flex-col items-center justify-center h-64 gap-4",
  errorIcon: "h-12 w-12 text-red-500"
};

// Fallback data aligned with API structure
const FALLBACK_DATA = {
  originalUrl: "https://example.com/original-url",
  shortId: "demo",
  clicks: 1284,
  createdAt: new Date().toISOString(),
  logs: Array.from({ length: 50 }, (_, i) => ({
    _id: `fallback-${i}`,
    shortId: "demo",
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: "Unknown",
    device: ["mobile", "desktop"][Math.floor(Math.random() * 2)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }))
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UrlAnalytics = ({ shortId = "demo" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchData = async (retryCount = 2) => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      try {
        const res = await axios.get(
          `https://link-shrinker-backend.onrender.com/api/urls/analytics/${shortId}`,
          { timeout: 10000 } // Increased timeout
        );

        if (res.data?.logs) {
          setData(res.data);
          return;
        }
      } catch (apiError) {
        if (retryCount > 0) {
          console.warn(`Retrying API call (${retryCount} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          return fetchData(retryCount - 1);
        }
        console.warn("API failed, using fallback data:", apiError.message);
      }

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

    return {
      originalUrl: data.originalUrl,
      totalClicks: data.clicks,
      uniqueVisitors: new Set(data.logs.map(log => log.ip)).size,
      createdAt: new Date(data.createdAt).toLocaleDateString(),
      deviceData: Object.entries(deviceData).map(([name, value]) => ({ name, value })),
      timeData,
      countryData: sortedCountries,
      usingFallback
    };
  };

  const analytics = processAnalytics();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingIcon} />
        <p className={styles.loadingText}>Loading analytics data...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle className={styles.errorIcon} />
        <p className={styles.loadingText}>No analytics data available</p>
        <button
          onClick={fetchData}
          className={styles.button}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {analytics.usingFallback && (
        <div className={styles.alertBanner}>
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            <p className="text-yellow-700">
              Showing demo data. The analytics API is currently unavailable.
            </p>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Link className="text-blue-500" /> URL Analytics
          </h1>
          <p className={styles.subtitle}>
            {analytics.originalUrl}
          </p>
        </div>
        <button
          onClick={fetchData}
          className={styles.button}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <Users className="text-blue-500" size={24} />
            <div>
              <h3 className={styles.cardLabel}>Total Clicks</h3>
              <p className={styles.cardValue}>{analytics.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <Globe className="text-green-500" size={24} />
            <div>
              <h3 className={styles.cardLabel}>Unique Visitors</h3>
              <p className={styles.cardValue}>{analytics.uniqueVisitors}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <Clock className="text-purple-500" size={24} />
            <div>
              <h3 className={styles.cardLabel}>Created</h3>
              <p className={styles.cardValue}>{analytics.createdAt}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <MapPin className="text-red-500" size={24} />
            <div>
              <h3 className={styles.cardLabel}>Countries</h3>
              <p className={styles.cardValue}>{analytics.countryData.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <Clock size={18} /> Daily Clicks (Last 7 Days)
          </h3>
          <div className={styles.chartContainer}>
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

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <Smartphone size={18} /> Device Distribution
          </h3>
          <div className={styles.chartContainer}>
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

      <div className={styles.fullWidthCard}>
        <h3 className={styles.chartTitle}>
          <Globe size={18} /> Countries
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

      <div className={styles.tableContainer}>
        <h3 className={styles.chartTitle}>
          <MapPin size={18} /> Recent Activity
        </h3>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Time</th>
              <th className={styles.tableHeaderCell}>Country</th>
              <th className={styles.tableHeaderCell}>Device</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.logs.slice(0, 5).map((log, index) => (
              <tr key={index}>
                <td className={styles.tableCell}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className={styles.tableCell}>
                  {log.country}
                </td>
                <td className={styles.tableCell + " capitalize"}>
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
