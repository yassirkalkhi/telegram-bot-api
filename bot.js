const { Telegraf } = require('telegraf');
require('dotenv').config(); 

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome! I am your friendly AI bot. How can I help you today?'));

bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;

    try {
       
        const llmResponse = await fetchOllama(userMessage)
        ctx.reply(llmResponse);
    } catch (error) {
        console.error('Error fetching response:', error);
        ctx.reply('Sorry, I encountered an error while processing your message.');
    }
});

const fetchOllama = async (prompt) => {
    const { Groq } = require('groq-sdk');
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'do not answer who you are just say I am an AI, make answering friendly with nice language, your name is Yassir' }, // System message
            { role: 'user', content: prompt } 
        ],
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
    });

    let response = '';
    for await (const chunk of chatCompletion) {
        response += chunk.choices[0]?.delta?.content || '';
    }
    return response;
};

// Launch the bot
bot.launch()
    .then(() => console.log('Telegram bot is running...'))
    .catch((error) => console.error('Failed to launch the bot:', error));
