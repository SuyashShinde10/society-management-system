import Project from '../models/Project';
import VendorQuote from '../models/VendorQuote';
import { aiQueue } from '../workers/aiQueue';

export const createProject = async (data: any, user: any) => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('NOT_AUTHORIZED');
  }
  const { title, description, specs, budget, deadline } = data;
  
  const project = new Project({
    title,
    description,
    specs,
    budget,
    deadline,
    createdBy: user._id,
    societyId: user.societyId || null
  });
  
  await project.save();
  return project;
};

export const getProjects = async (user: any) => {
  let filter: any = {};
  if (user.role === 'admin') {
    if (!user.societyId) throw new Error('ADMIN_NO_SOCIETY');
    filter.societyId = user.societyId;
  }
  return await Project.find(filter).sort({ createdAt: -1 });
};

export const getProjectDetails = async (projectId: string) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  
  const quotes = await VendorQuote.find({ projectId: project._id });
  return { project, quotes };
};

export const getProjectPublicDetails = async (projectId: string) => {
  const project = await Project.findById(projectId).select('title description specs budget status deadline');
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  return project;
};

export const submitQuote = async (projectId: string, data: any) => {
  const { vendorName, vendorEmail, vendorPhone, quoteAmount, timeline, notes } = data;
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  if (project.status !== 'Open') {
    throw new Error('PROJECT_NOT_OPEN');
  }

  const quote = new VendorQuote({
    projectId,
    vendorName,
    vendorEmail,
    vendorPhone,
    quoteAmount,
    timeline,
    notes
  });

  await quote.save();
  return quote;
};

export const analyzeQuotes = async (projectId: string, user: any) => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('NOT_AUTHORIZED');
  }

  const project = await Project.findById(projectId);
  if (!project) throw new Error('PROJECT_NOT_FOUND');

  const quotes = await VendorQuote.find({ projectId });
  if (quotes.length === 0) {
    throw new Error('NO_QUOTES_TO_ANALYZE');
  }

  const job = await aiQueue.add('analyzeQuotes', { projectId });
  
  project.status = 'Analyzing' as any;
  await project.save();

  return { job, project };
};
