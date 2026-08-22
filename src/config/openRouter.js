import { OpenRouter } from '@openrouter/sdk';

if(!process.env.API_KEY){
    throw new Error("OpenRoter API Key Is Missing");
}

const openRouter = new OpenRouter({
    apiKey: process.env.API_KEY
})

export default openRouter;