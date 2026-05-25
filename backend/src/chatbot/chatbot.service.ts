import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ChatbotService {
  constructor(private readonly productsService: ProductsService) {}

  async generateResponse(userMessage: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      return this.generateMockedAIResponse(userMessage);
    }

    try {
      // 1. Fetch live product catalog
      const products = await this.productsService.findAll();
      const productCatalogText = products
        .map(
          (p) =>
            `- ID: ${p.id}, Name: "${p.name}", Category: "${
              p.category || 'General'
            }", Price: Rs.${p.price}, Stock: ${p.stock} units, Description: "${
              p.description || ''
            }"`
        )
        .join('\n');

      // 2. Prepare the rich context-aware system instructions
      const systemInstruction = `
You are "VMS Assistant", the friendly and highly intelligent AI shopping concierge for VMS Super Mart.
VMS Super Mart is a premium grocery and department supermarket located in Akuressa, Southern Province, Sri Lanka.

Follow these strict rules:
1. Currency: Always use Sri Lankan Rupee ("Rs.") for prices.
2. Policies: 
   - Delivery: We deliver to Akuressa, Matara, and surrounding areas. Delivery is FREE for orders above Rs. 2,000. For orders below Rs. 2,000, there is a small delivery fee of Rs. 250.
   - Return Policy: 7-day hassle-free return/exchange on packaged goods. Fresh produce/dairy must be checked at the time of delivery.
   - Contact Info: Email support@vmssupermart.com or phone +94 41 223 4567.
   - Working Hours: Open daily from 8:00 AM to 10:00 PM.
3. Live Product Catalog:
Here is the active product database catalog from VMS Super Mart:
${productCatalogText}

When answering customer questions, ALWAYS refer to products from this catalog if applicable. Include prices and stock availability.
IMPORTANT: To recommend a product to a customer so the front-end can display an interactive checkout card, output the product reference in this EXACT format: [PRODUCT_CARD:id] (e.g. [PRODUCT_CARD:1]). Do not invent ids, only use the ID listed in the catalog above. You can recommend multiple product cards.
Keep responses friendly, professional, helpful, and under 3-4 sentences if possible. Speak directly to the shopper.
`;

      const prompt = `${systemInstruction}\n\nCustomer: ${userMessage}\nAI Assistant:`;

      // 3. Invoke Google Gemini 1.5 Flash API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('Failed to parse text from Gemini response');
      }

      return aiResponse.trim();
    } catch (error) {
      console.error('Chatbot generateResponse error:', error);
      return this.generateMockedAIResponse(userMessage);
    }
  }

  private async generateMockedAIResponse(userMessage: string): Promise<string> {
    const products = await this.productsService.findAll();
    const query = userMessage.toLowerCase();

    let reply = "Hello! Welcome to VMS Super Mart. I'm your AI Shopping Assistant. How can I help you today? (Note: To sync real-time AI responses, please add a valid Gemini API Key to your .env file!)";

    if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
      reply = "Hello there! Welcome to VMS Super Mart. I am here to help you shop our fresh catalog. What are you looking to buy today?";
    } else if (query.includes('shipping') || query.includes('delivery') || query.includes('cost') || query.includes('free')) {
      reply = "We offer FREE delivery for all orders above Rs.2,000 to Akuressa and surrounding areas! For orders under Rs.2,000, we charge a flat fee of Rs.250.";
    } else if (query.includes('timing') || query.includes('hour') || query.includes('open') || query.includes('close')) {
      reply = "VMS Super Mart is open daily from 8:00 AM to 10:00 PM. We are open even on holidays to serve you best!";
    } else if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('call')) {
      reply = "You can contact our support team at support@vmssupermart.com or call us directly at +94 41 223 4567. We are happy to help!";
    } else {
      const matches = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        const productList = matches
          .slice(0, 2)
          .map((p) => `- ${p.name} for Rs.${p.price} [PRODUCT_CARD:${p.id}]`)
          .join('\n');
        reply = `Yes, we have that in stock! Here is what we found:\n${productList}\nWould you like me to guide you to the details page of any of these items?`;
      } else {
        const popular = products.slice(0, 2);
        if (popular.length > 0) {
          const list = popular
            .map((p) => `- ${p.name} (Rs.${p.price}) [PRODUCT_CARD:${p.id}]`)
            .join('\n');
          reply = `I couldn't find a direct match for that in our current database, but here are some of our popular products at VMS Super Mart:\n${list}\nFeel free to search for fresh vegetables, milk, groceries or headphones!`;
        }
      }
    }

    return reply;
  }
}
