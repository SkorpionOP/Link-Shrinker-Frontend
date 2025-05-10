const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const ClickLog = require('../models/ClickLog');  // Import ClickLog model
const uaParser = require('ua-parser-js');
const geoip = require('geoip-lite');


// Redirect to original URL
router.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (!url) return res.status(404).send("Not found");

  url.clicks++;
  await url.save();

  // Log click
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip) || {};
  const ua = uaParser(req.headers['user-agent']);

  await ClickLog.create({
    shortId,
    ip,
    country: geo.country || 'Unknown',
    device: ua.device.type || 'Desktop',
    timestamp: new Date(),
  });

  res.redirect(url.originalUrl);
});

// POST /api/urls/shorten
router.post('/shorten', async (req, res) => {
  const { originalUrl, createdBy } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // Simple URL validation using a regular expression
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let shortId = nanoid(6); // Generate a short ID (e.g., "abc123")

  try {
    // Ensure the generated shortId is unique before saving
    let urlDoc = await Url.findOne({ shortId });
    while (urlDoc) {
      shortId = nanoid(6); // Regenerate shortId if it already exists
      urlDoc = await Url.findOne({ shortId });
    }

    // Create a new URL document and save it to the database
    const newUrl = new Url({ originalUrl, shortId, createdBy });
    await newUrl.save();

    // Return the shortened URL
    res.json({ shortUrl: `${req.protocol}://${req.get('host')}/api/urls/${shortId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// GET /api/urls/analytics/:shortId (Get analytics for a shortened URL)
router.get('/analytics/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortId });
    if (!urlDoc) return res.status(404).json({ error: 'URL not found' });

    // Return analytics data
    res.json({
      originalUrl: urlDoc.originalUrl,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Optional: Get all links for a user (by user ID)
router.get('/user/links/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const urls = await Url.find({ createdBy: uid });
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user links' });
  }
});

// In your backend routes (Express)
router.delete('/urls/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get userId (you should implement this function)
    let userId;
    try {
      userId = verifyTokenAndGetUserId(token);  // Custom function to verify JWT
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const url = await Url.findOne({ shortId });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (url.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this URL' });
    }

    await Url.deleteOne({ shortId });
    await ClickLog.deleteMany({ shortId });

    res.status(200).json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      error: 'Failed to delete URL',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


module.exports = router;
