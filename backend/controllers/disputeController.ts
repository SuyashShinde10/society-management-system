import { Request, Response } from 'express';
import Dispute from '../models/Dispute';
import MaintenanceBill from '../models/MaintenanceBill';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// @ts-ignore
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import logger from '../utils/logger';

// Lazy Gemini LLM initializer
const getLLM = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    logger.warn('// GEMINI_API_KEY not configured. Running in fallback mode.');
    return null;
  }
  return new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0,
    apiKey
  });
};


export const initiateDispute = async (req: Request, res: Response) => {
  try {
    const { maintenanceBillId } = req.body;
    
    // Check if a dispute already exists for this bill
    let dispute = await Dispute.findOne({ maintenanceBillId, userId: (req as any).user._id });
    if (!dispute) {
      dispute = new Dispute({
        maintenanceBillId,
        userId: (req as any).user._id,
        status: 'Open',
        chatHistory: []
      });
      await dispute.save();

      // Update bill to show dispute is in progress
      await MaintenanceBill.findByIdAndUpdate(maintenanceBillId, { aiDisputeStatus: 'In-Progress' });
    }

    res.status(200).json({ dispute });
  } catch (error) {
    logger.error('Error initiating dispute:', error);
    res.status(500).json({ error: 'Server error initiating dispute' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { disputeId, message } = req.body;
    
    const dispute = await Dispute.findOne({ _id: disputeId, userId: (req as any).user._id });
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    
    if (dispute.status === 'Resolved') {
      return res.status(400).json({ error: 'Dispute is already resolved' });
    }

    const resolveDisputeTool = tool(
      async () => {
        // Mark the bill as paid (Admin only via UI, or AI just flags it)
        await MaintenanceBill.findByIdAndUpdate(dispute.maintenanceBillId, {
          aiDisputeStatus: 'Resolved',
          notes: `Auto-resolved by AI via Dispute ${dispute._id}`
        });

        dispute.status = 'Resolved';
        await dispute.save();

        return "Dispute resolved successfully. If payment was made via Stripe, it will be automatically updated.";
      },
      {
        name: 'resolve_dispute',
        description: 'Marks the dispute as resolved. Call this when the user is satisfied or the issue is solved.',
        schema: z.object({})
      }
    );

    const llm = getLLM();
    if (!llm) {
      const fallbackReply = "Your billing dispute has been registered for committee review. AI automated agent is currently awaiting API key configuration.";
      dispute.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
      dispute.chatHistory.push({ role: 'agent', content: fallbackReply, timestamp: new Date() });
      await dispute.save();
      return res.status(200).json({ dispute, aiMessage: fallbackReply });
    }

    const agent = createReactAgent({
      llm,
      tools: [resolveDisputeTool],
      messageModifier: `You are an AI assistant helping a resident resolve a billing dispute. 
      If they say they have paid, tell them payments via Stripe take a few minutes to reflect.
      Use resolve_dispute when the issue is clarified. 
      Be polite and concise.`
    });

    // Reconstruct history for LangChain
    const messages = dispute.chatHistory.map(msg => 
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );
    messages.push(new HumanMessage(message));

    // Save user message
    dispute.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });

    // Run agent
    const result = await agent.invoke({ messages });

    const aiResponse = result.messages[result.messages.length - 1].content;
    
    // Save AI message
    dispute.chatHistory.push({ role: 'agent', content: aiResponse as string, timestamp: new Date() });
    await dispute.save();

    res.status(200).json({ 
      dispute,
      aiMessage: aiResponse
    });

  } catch (error) {
    logger.error('Error in agent conversation:', error);
    res.status(500).json({ error: 'Server error in AI conversation' });
  }
};
