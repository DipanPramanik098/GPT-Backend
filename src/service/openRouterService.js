import openRouter from "../config/openRouter.js"


// send message to ai and return ai reply
export const generateAiResponse = async ({model, messages}) => {
    const completion = await openRouter.chat.send({
        chatRequest:{
            model,
            messages
        }
    })

    const aiReply = completion.choices[0]?.message?.content;

    if(!aiReply){
        throw new Error("AI Response Is Empty");
    }

    const promptTokens = completion.usage?.promptTokens || 0;
    const completionTokens = completion.usage?.completionTokens || 0;

    return {
        aiReply,
        usage: {
            promptTokens,
            completionTokens,
            totalTokens : promptTokens + completionTokens,
        }
    }
}