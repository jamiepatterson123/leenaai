
export async function createThread(): Promise<string> {
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  if (!threadResponse.ok) {
    const errorText = await threadResponse.text();
    console.error('Failed to create thread:', errorText);
    throw new Error('Failed to create thread');
  }

  const threadData = await threadResponse.json();
  console.log('Created new thread:', threadData.id);
  return threadData.id;
}

export async function addMessageToThread(threadId: string, messageContent: any[]): Promise<void> {
  const messagePayload = {
    role: 'user',
    content: messageContent
  };

  console.log('Adding message to thread with content types:', messageContent.map(c => c.type));

  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify(messagePayload)
  });

  if (!messageResponse.ok) {
    const errorText = await messageResponse.text();
    console.error('Failed to add message to thread:', errorText);
    throw new Error(`Failed to add message to thread: ${errorText}`);
  }

  console.log('Successfully added message to thread');
}

export async function createAndWaitForRun(threadId: string, assistantId: string): Promise<void> {
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    console.error('Failed to create run:', errorText);
    throw new Error('Failed to create run');
  }

  const runData = await runResponse.json();
  const runId = runData.id;
  console.log('Created run:', runId);

  // Poll for completion
  let runStatus = 'queued';
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds timeout
  
  while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to check run status');
    }

    const statusData = await statusResponse.json();
    runStatus = statusData.status;
    attempts++;
    
    console.log(`Run status: ${runStatus}, attempt: ${attempts}`);
  }

  if (runStatus === 'failed') {
    throw new Error('Assistant run failed');
  }

  if (runStatus !== 'completed') {
    throw new Error('Assistant run timed out');
  }
}

export async function getLatestAssistantMessage(threadId: string): Promise<string> {
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`, {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!messagesResponse.ok) {
    throw new Error('Failed to get messages');
  }

  const messagesData = await messagesResponse.json();
  const assistantMessage = messagesData.data[0];
  
  if (!assistantMessage || assistantMessage.role !== 'assistant') {
    throw new Error('No assistant response found');
  }

  return assistantMessage.content[0]?.text?.value || 
         "I'm here to help with your nutrition goals. Could you tell me more about what you'd like assistance with?";
}
