import { Request, Response } from 'express';
import User from '../models/User';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import logger from '../utils/logger';

const getSmartFallbackResponse = (message: string, residentName: string, societyName: string): string => {
  const query = (message || '').toLowerCase().trim();

  if (query.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|greetings)\b/i)) {
    return `Hello ${residentName}! Welcome to ${societyName}'s AI Assistant. How can I help you today? You can ask me about maintenance bills, booking society facilities, logging complaints, gate deliveries, or guest entry passes.`;
  }

  if (query.match(/\b(bill|bills|payment|pay|dues|invoice|maintenance\s*fee|receipt|stripe)\b/i)) {
    return `You can view your outstanding maintenance fees, payment history, and pay bills under the **My Bills** module. If you notice any discrepancy, you can also initiate an automated dispute directly from the bill entry.`;
  }

  if (query.match(/\b(complaint|complaints|repair|plumb|electric|leak|pipe|lift|elevator|garbage|noise|maintenance\s*issue|broken)\b/i)) {
    return `For maintenance repairs or society issues (such as plumbing, electrical, or lift problems), please log a ticket in the **Complaints** module. You can monitor the resolution status in real-time as the team works on it.`;
  }

  if (query.match(/\b(parcel|parcels|delivery|deliveries|courier|package|packages|amazon|flipkart|order)\b/i)) {
    return `Deliveries accepted at the main gate are recorded under **Gate Parcels**. Check that section to view awaiting parcels along with your secure Claim OTP to present to the security guard upon collection.`;
  }

  if (query.match(/\b(pass|passes|visitor|visitors|guest|guests|entry|cab|uber|ola|zomato|swiggy|qr)\b/i)) {
    return `You can pre-authorize visitors by generating a digital pass in the **Guest Passes** module. The generated QR code or 6-digit entry code allows instant gate clearance for your visitors.`;
  }

  if (query.match(/\b(amenity|amenities|facility|facilities|clubhouse|pool|swimming|gym|court|hall|banquet|book|booking|reserve)\b/i)) {
    return `Society amenities like the Clubhouse, Swimming Pool, Gym, and Banquet Hall can be reserved in advance under the **Facility Bookings** module. Check available slots and book directly online.`;
  }

  if (query.match(/\b(parking|car|slot|slots|vehicle|vehicles|bike|scooter)\b/i)) {
    return `Your assigned parking slot and registered vehicles are detailed in **My Profile**. If you require an additional slot or notice unauthorized parking, contact the management committee or security office.`;
  }

  if (query.match(/\b(meeting|meetings|agm|agenda|vote|voting|election|resolution)\b/i)) {
    return `Details of upcoming society committee meetings, general body announcements, and active digital ballots are available under **Global Meetings** and **Digital AGM Voting**.`;
  }

  if (query.match(/\b(intercom|guard|security\s*guard|gate\s*phone|contact\s*security)\b/i)) {
    return `You can instantly ring the main guard gate through the **Guard Intercom** feature on your dashboard for immediate assistance from on-duty security staff.`;
  }

  if (query.match(/\b(thank|thanks|thank\s*you|bye|goodbye|see\s*you)\b/i)) {
    return `You're very welcome, ${residentName}! Feel free to reach out anytime you need assistance with society services. Have a great day!`;
  }

  return `I am your AI assistant for ${societyName}. You can manage all resident services from your sidebar: check **My Bills**, track **Gate Parcels**, request **Guest Passes**, log **Complaints**, or view the **Notice Board**. What would you like help with?`;
};

export const queryChatbot = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = (req as any).user?.id || (req as any).user?._id;
    let residentName = 'Resident';
    let societyName = 'Awaastech Society';
    let flatInfo = '';

    if (userId) {
      try {
        const userDoc = await User.findById(userId).populate('societyId', 'name city');
        if (userDoc) {
          residentName = userDoc.name || residentName;
          if (userDoc.societyId && typeof userDoc.societyId === 'object') {
            societyName = (userDoc.societyId as any).name || societyName;
          }
          if (userDoc.flatDetails?.wing && userDoc.flatDetails?.flatNumber) {
            flatInfo = ` (Wing ${userDoc.flatDetails.wing}, Flat ${userDoc.flatDetails.flatNumber})`;
          }
        }
      } catch (userErr) {
        logger.warn('Chatbot user lookup non-fatal error:', userErr);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey && !apiKey.startsWith('AQ.')) {
      try {
        const llm = new ChatGoogleGenerativeAI({
          model: 'gemini-1.5-flash',
          temperature: 0.3,
          apiKey,
        });

        const prompt = `You are a polite, helpful AI society assistant for a residential community named "${societyName}".
The resident speaking with you is named ${residentName}${flatInfo}.
Answer their question concisely and practically in 2-3 sentences.
- For maintenance bills or payments: direct them to the "My Bills" module.
- For repairs or issues (plumbing, electrical, lift): direct them to "Complaints".
- For deliveries: mention "Gate Parcels" and Claim OTP.
- For visitors or cabs: mention digital QR codes in "Guest Passes".
- For clubhouse or gym: mention "Facility Bookings".
- For gate contact: mention "Guard Intercom".

Resident Query: "${message.trim()}"`;

        const aiResponse = await llm.invoke(prompt);
        const replyText = typeof aiResponse.content === 'string' ? aiResponse.content : String(aiResponse.content);
        if (replyText && replyText.trim()) {
          return res.status(200).json({ response: replyText.trim() });
        }
      } catch (llmErr: any) {
        logger.warn('Chatbot Gemini LLM call fell back to smart rule engine:', llmErr.message || llmErr);
      }
    }

    // Smart context-aware fallback response
    const fallbackResponse = getSmartFallbackResponse(message, residentName, societyName);
    return res.status(200).json({ response: fallbackResponse });
  } catch (error) {
    logger.error('Error in chatbot query:', error);
    res.status(500).json({ error: 'Failed to process chatbot query.' });
  }
};
