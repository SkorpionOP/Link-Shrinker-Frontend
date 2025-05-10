import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";
import {
  Globe, Users, Calendar, Download, RefreshCw, Filter
} from "lucide-react";
import "./modern.css";

const fallbackData = {
  totalClicks: 1534,
  uniqueUsers: 892,
  averageClicksPerUser: 1.72,
  countries: [
    { name: "United States", clicks: 450, color: "#3B82F6" },
    { name: "India", clicks: 320, color: "#10B981" },
    { name: "United Kingdom", clicks: 280, color: "#F59E0B" },
    { name: "Germany", clicks: 210, color: "#6366F1" },
    { name: "Others", clicks: 274, color: "#9CA3AF" },
  ],
  timeData: [
    { hour: "00:00", clicks: 45 },
    { hour: "04:00", clicks: 28 },
    { hour: "08:00", clicks: 120 },
    { hour: "12:00", clicks: 185 },
    { hour: "16:00", clicks: 165 },
    { hour: "20:00", clicks: 98 },
  ],
  deviceData: [
    { name: "Mobile", value: 65, color: "#3B82F6" },
    { name: "Desktop", value: 30, color: "#10B981" },
    { name: "Tablet", value: 5, color: "#F59E0B" },
  ],
};

const UrlAnalytics = ({ shortId = "oIZYiD" }) => {
  const [dateRange, setDateRange] = useState("last7days");
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/urls/${shortId}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };
  fetchAnalytics();
}, [shortId]);


  const data = analytics || fallbackData;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">URL Analytics</h1>
        <p className="analytics-subtitle">
          Detailed analysis of your shortened URL performance
        </p>
      </div>

      <div className="analytics-buttons">
        <button className="analytics-button blue" onClick={() => setDateRange("last7days")}>
          <Calendar size={20} />
          {dateRange}
        </button>
        <button className="analytics-button gray">
          <Download size={20} />
          Export Report
        </button>
        <button className="analytics-button gray">
          <RefreshCw size={20} />
          Refresh Data
        </button>
        <button className="analytics-button gray">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="analytics-overview">
        <div className="analytics-card">
          <div className="analytics-card-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="analytics-card-content">
            <span className="analytics-card-title">Total Clicks</span>
            <span className="analytics-card-value">{data.totalClicks}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon icon-green">
            <Globe size={24} />
          </div>
          <div className="analytics-card-content">
            <span className="analytics-card-title">Unique Users</span>
            <span className="analytics-card-value">{data.uniqueUsers}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="analytics-bar-container">
        <BarChart width={800} height={300} data={data.timeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clicks" fill="#3B82F6" />
        </BarChart>
      </div>

      {/* Device Pie Chart */}
      <div className="analytics-pie-container">
        <PieChart width={400} height={400}>
          <Pie
            data={data.deviceData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {data.deviceData.map((entry, index) => (
              <Cell key={`cell-device-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* Country Pie Chart */}
      <div className="analytics-pie-container">
        <PieChart width={400} height={400}>
          <Pie
            data={data.countries}
            dataKey="clicks"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {data.countries.map((entry, index) => (
              <Cell key={`cell-country-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
};

export default UrlAnalytics;
