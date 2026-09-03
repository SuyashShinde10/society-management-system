const { Queue, Worker } = require('bullmq');
const getRedis = require('../utils/redis');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const Project = require('../models/Project');
const VendorQuote = require('../models/VendorQuote');
const Complaint = require('../models/Complaint');
const MaintenanceBill = require('../models/MaintenanceBill');
const User = require('../models/User');
const logger = require('../utils/logger');

let aiQueue = {
  add: async (name, data) => {
    logger.warn('Mock Queue add. Redis disabled or offline.');
    return { id: `mock-job-${Date.now()}` };
  }
};
let connection;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connection = getRedis();
  try {
    const queue = new Queue('ai-jobs', { connection });
    queue.on('error', () => {});
    aiQueue = queue;
  } catch (err) {
    logger.warn('AI Queue fallback active (Redis offline).');
  }
}

const getLLM = () => {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-3.6-flash',
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY
  });
};

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && connection) {
try {
const worker = new Worker('ai-jobs', async job => {
  if (job.name === 'analyzeQuotes') {
    const { projectId } = job.data;
    const project = await Project.findById(projectId);
    const quotes = await VendorQuote.find({ projectId });
    
    if (!project || quotes.length === 0) return;

    const quotesText = quotes.map((q, index) => {
      return `Vendor ${index + 1} (${q.vendorName}):
- Amount: ₹${q.quoteAmount}
- Timeline: ${q.timeline}
- Notes/Conditions: ${q.notes || 'None'}`;
    }).join('\n\n');

    const prompt = `You are an expert procurement analyst for a housing society.
    
Here are the details of the project:
Title: ${project.title}
Budget: ₹${project.budget || 'Not specified'}
Specs: ${project.specs || project.description}

Here are the quotes received from vendors:
${quotesText}

Please generate a professional, concise comparison matrix and summary for the society committee. Highlight the pros and cons of each vendor, note any who are over budget, and provide a final recommendation based on a balance of cost and timeline.`;

    const llm = getLLM();
    const response = await llm.invoke(prompt);

    project.aiAnalysis = response.content;
    project.status = 'Analysis_Complete';
    await project.save();
    return { success: true, projectId, analysis: response.content };
  }
  
  if (job.name === 'chatbot') {
    const { residentId, message } = job.data;
    const resident = await User.findById(residentId);
    if (!resident) return;
    
    const llm = getLLM();
    const prompt = `You are an AI assistant for a residential society. The resident asking this is named ${resident.name}.
    Answer their question concisely and politely. 
    If they ask about maintenance, tell them they can log a complaint in the Complaint Box.
    If they ask about bills, tell them to check the Billing module.
    
    Resident Question: "${message}"`;
    const response = await llm.invoke(prompt);
    return { success: true, response: response.content };
  }

  if (job.name === 'predictiveMaintenance') {
    const { societyId, complaintData } = job.data;
    const llm = getLLM();
    const prompt = `Analyze the following maintenance complaints from the last 3 months. Identify any recurring failure patterns or anomalies. Produce a highly structured recommendation for preventative maintenance. 
    Complaints: ${JSON.stringify(complaintData)}`;
    const response = await llm.invoke(prompt);
    // Ideally, we would save this to a Society/Analytics model or emit an event
    return { success: true, analysis: response.content };
  }

  if (job.name === 'sentimentAnalysis') {
    const { societyId, complaintData } = job.data;
    const llm = getLLM();
    const prompt = `Analyze the sentiment of the following resident complaints from the past month.
    Based on the severity, tone, and volume, calculate a Resident Happiness Score from 0 to 100 (where 100 is perfectly happy, and 0 is extremely frustrated).
    Provide a short explanation for the score.
    
    Complaints: ${JSON.stringify(complaintData)}
    
    Output strictly as JSON in the following format:
    {
      "score": <number>,
      "explanation": "<string>"
    }`;
    const response = await llm.invoke(prompt);
    // Ideally, we would save this to a Society/Analytics model or emit an event
    return { success: true, analysis: response.content };
  }
}, { connection });

    const { dlqManager } = require('../utils/dlq');
    worker.on('error', () => {});
    worker.on('failed', (job, err) => {
      dlqManager.handleFailedJob('ai-jobs', job, err);
    });
  } catch (err) {
    logger.warn('AI Worker fallback active (Redis offline).');
  }
}

module.exports = { aiQueue };
